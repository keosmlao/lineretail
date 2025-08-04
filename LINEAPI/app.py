# /api/liff/login
from flask import Flask, request, jsonify
from flask_cors import CORS
from dbconn import *
app = Flask(__name__)
CORS(app)
# CORS(app, origins=["http://localhost:80", "http://10.0.10.109:80","https://f74935bfdcb1.ngrok-free.app"])
from decimal import Decimal


@app.route('/api/liff/login', methods=['POST'])
def liff_login():
    data = request.json
    # บันทึกหรืออัพเดต user ได้เลย
    print('✅ User Login:', data)
    with getcursor() as cur:
        cur.execute("""
                    select a.code,a.name_1,point_balance,c.name_1 as name_member,c.name_2 as level,c.discount from ar_customer a 
                    left join ar_customer_detail b on b.ar_Code=a.code
                    left join public.ar_group_sub c on c.code=b.group_sub_1
                    where a.line_id=%s""", (data['user_id'],))
        user = cur.fetchone()
        print('✅ User Data:', user)
    return jsonify({"success": True, "message": "Login successful", "data": user})




@app.route('/api/product')
def product():
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    offset = (page - 1) * limit
    q = request.args.get("q", "").strip()

    where = "b.group_main NOT IN ('12','98')"
    params = [limit, offset]

    # ถ้ามี keyword ให้ค้นหาด้วยชื่อ
    if q:
        where += " AND (a.ic_name ILIKE %s OR a.ic_code ILIKE %s)"
        params = ['%' + q + '%', '%' + q + '%'] + params

    with getcursor() as cur:
        cur.execute(f"""
        WITH stock AS (
          SELECT *
          FROM sml_ic_function_stock_balance_warehouse_location('2099-12-31', '', '1102', '110201')
          WHERE balance_qty > 0
          ORDER BY ic_code
        )
        SELECT a.ic_code, a.ic_name, (a.balance_qty::int)::text AS balance_qty,
               a.ic_unit_code, b.average_cost, COALESCE(c.barcode, '') as barcode,
               b.item_brand, b.average_cost::text as average_cost,
               f.name_1 as item_cat_name,
               (SELECT url_image FROM product_image 
                WHERE ic_code = a.ic_code order by roworder LIMIT 1) as url_image,
               COALESCE((SELECT sale_price1 FROM ic_inventory_price 
                         WHERE current_date BETWEEN from_date AND to_date 
                         AND currency_code = '02' 
                         AND ic_code = a.ic_code 
                         AND unit_code = a.ic_unit_code 
                         ORDER BY roworder DESC LIMIT 1), 0) as sale_price,have_point
        FROM stock a
        LEFT JOIN ic_inventory b ON b.code = a.ic_code
        LEFT JOIN ic_inventory_barcode c ON c.ic_code = b.code
        LEFT JOIN ic_inventory_detail d ON d.ic_code = a.ic_code
        LEFT JOIN ic_category f ON f.code = b.item_category
        WHERE {where}
        LIMIT %s OFFSET %s
        """, tuple(params))

        listitem = cur.fetchall()
    return jsonify({'list': listitem})

def getexchange_rate():
    with getcursor() as cur:
        cur.execute("select exchange_rate_present from erp_currency where code='02'")
        rate = cur.fetchone()
        return rate['exchange_rate_present'] 




@app.route('/api/order', methods=['POST'])
def order():
    body = request.get_json()
    print('✅ Order Body:', body)
    doc_format_code = 'CALI'
    doc_no = getdocno()
    print('✅ Document Number:', doc_no)
    dateTimeObj = datetime.now()
    doc_date = dateTimeObj.strftime("%Y-%m-%d")
    doc_time = dateTimeObj.strftime("%H:%M")
    print('✅ Order Data:', body['customer']['usercode'])
    baht_amount =getexchange_rate()* body['total_amount']
    exchange_rate = Decimal(getexchange_rate())  # ensure exchange_rate is Decimal
    with getcursor() as cur:
        if body['payment_type'] =='cash':
            # save to sml ic_trans
            sql = """
            INSERT INTO ic_trans (
                trans_type, trans_flag, doc_date, doc_no, vat_type, cust_code,
                branch_code, currency_code, total_value, total_amount, doc_time,
                doc_format_code, creator_code, total_amount_2, total_value_2,
                inquiry_type, sale_code, side_code, department_code,doc_ref,sum_point
            ) VALUES (2, 34, %s, %s, 2, %s,'00', '02', %s, %s, %s,%s, %s, %s, %s,%s, %s, %s, %s, %s, %s)"""
            datatotrand = (
                doc_date,
                doc_no,
                body['customer']['usercode'],
                baht_amount,
                baht_amount,
                doc_time,
                doc_format_code,
                '',  # creator_code
                body['total_amount'],
                body['total_amount'],
                '1',  # inquiry_type
                '',   # sale_code
                '200',  # side_code
                '2019',  # department_code
                body['orderId'],
                body['total_point']  # sum_point
                )
            cur.execute(sql, datatotrand)
            # Insert each item into detail table
            sql_detail = """
            INSERT INTO ic_trans_detail (
                trans_type, trans_flag, doc_date, doc_no, cust_code,
                item_code, item_name, unit_code, qty, price, discount, sum_amount,
                branch_code, wh_code, shelf_code, calc_flag, doc_time, inquiry_type,
                stand_value, divide_value, doc_date_calc, doc_time_calc,
                sum_of_cost, discount_amount, price_2, sum_amount_2,doc_ref
            ) VALUES (2, 34, %s, %s, %s,%s, %s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s,1, 1, %s, %s,%s, %s, %s, %s, %s)"""
            for item in body['items']:
                qty = Decimal(str(item['qty']))
                sale_price = Decimal(str(item['sale_price']))
                discount = Decimal(str(item.get('discount_amount', 0)))
                price_after = Decimal(str(item['price_after_discount']))
                cost = Decimal(str(item.get('average_cost', 0)))
                print('✅ cost Data:', cost)
                sum_amount = price_after * qty * exchange_rate
                sum_of_cost = cost * qty * exchange_rate

                data_to_detail = (
                    doc_date,
                   doc_no,
                    body['customer']['usercode'],
                    item['ic_code'],
                    item['ic_name'],
                    item['ic_unit_code'],
                    float(qty),
                    float(sale_price* exchange_rate),
                    float(discount * exchange_rate),
                    float(sum_amount),
                    '00',
                    '1102',
                    '110201',
                    -1,
                    doc_time,
                    '1',
                    doc_date,
                    doc_time,
                    float(sum_of_cost),
                    float(discount),
                    float(sale_price),
                    float(price_after * qty),
                    body['orderId'])
                cur.execute(sql_detail, data_to_detail)
                print('Payment type is cash')
        else:
            print('Payment type is transfer')
            # สำหรับการชำระเงินแบบโอนเงิน
            # save to sml ic_trans
            sql = """
            INSERT INTO ic_trans (
                trans_type, trans_flag, doc_date, doc_no, vat_type, cust_code,
                branch_code, currency_code, total_value, total_amount, doc_time,
                doc_format_code, creator_code, total_amount_2, total_value_2,
                inquiry_type, sale_code, side_code, department_code,doc_ref,sum_point
            ) VALUES (2, 44, %s, %s, 2, %s,'00', '02', %s, %s, %s,%s, %s, %s, %s,%s, %s, %s, %s, %s, %s)"""
            datatotrand = (
                doc_date,
                doc_no,
                body['customer']['usercode'],
                baht_amount,
                baht_amount,
                doc_time,
                doc_format_code,
                '',  # creator_code
                body['total_amount'],
                body['total_amount'],
                '1',  # inquiry_type
                '',   # sale_code
                '200',  # side_code
                '2019',  # department_code
                body['orderId'],
                body['total_point']  # sum_point
            )

            cur.execute(sql, datatotrand)

            # Insert each item into detail table
            sql_detail = """
            INSERT INTO ic_trans_detail (
                trans_type, trans_flag, doc_date, doc_no, cust_code,
                item_code, item_name, unit_code, qty, price, discount, sum_amount,
                branch_code, wh_code, shelf_code, calc_flag, doc_time, inquiry_type,
                stand_value, divide_value, doc_date_calc, doc_time_calc,
                sum_of_cost, discount_amount, price_2, sum_amount_2,doc_ref
            ) VALUES (2, 44, %s, %s, %s,%s, %s, %s, %s, %s, %s, %s,%s, %s, %s, %s, %s, %s,1, 1, %s, %s,%s, %s, %s, %s, %s)"""
            for item in body['items']:
                qty = Decimal(str(item['qty']))
                sale_price = Decimal(str(item['sale_price']))
                discount = Decimal(str(item.get('discount_amount', 0)))
                price_after = Decimal(str(item['price_after_discount']))
                cost = Decimal(str(item.get('average_cost', 0)))
                print('✅ cost Data:', cost)
                sum_amount = price_after * qty * exchange_rate
                sum_of_cost = cost * qty * exchange_rate

                data_to_detail = (
                    doc_date,
                    doc_no,
                    body['customer']['usercode'],
                    item['ic_code'],
                    item['ic_name'],
                    item['ic_unit_code'],
                    float(qty),
                    float(sale_price* exchange_rate),
                    float(discount * exchange_rate),
                    float(sum_amount),
                    '00',
                    '1102',
                    '110201',
                    -1,
                    doc_time,
                    '1',
                    doc_date,
                    doc_time,
                    float(sum_of_cost),
                    float(discount),
                    float(sale_price),
                    float(price_after * qty),
                    body['orderId']
                )
                cur.execute(sql_detail, data_to_detail)
            # save to cb_trans SML 
            sql_h="""insert into cb_trans(trans_type,trans_flag,doc_date,doc_no,total_amount,total_net_amount,tranfer_amount,total_amount_pay,ap_ar_code,pay_type,doc_format_code)values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"""
            cur.execute(sql_h, (2,44,doc_date,doc_no,baht_amount,baht_amount,baht_amount,baht_amount,body['customer']['usercode'],1,doc_format_code))
            # save to cb_trans_detail SML 
            cur.execute("""insert into cb_trans_detail(trans_type,trans_flag,doc_date,doc_no,trans_number,bank_code,bank_branch,amount,chq_due_date,doc_type,currency_code,sum_amount_2)
                    values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",(2,44,doc_date,doc_no,"1010201","1010201",'BCEL01',body["total_amount"],doc_date,1,'02',baht_amount))
            cur.execute("update ar_customer set point_balance=point_balance+%s where code=%s",(body['total_point'],body['customer']['usercode']))
    return jsonify({"success": True, "message": "Order placed successfully"})





@app.route('/api/order/getdocno')
def getdocno():
    with getcursor() as cur:
        dateTimeObj = datetime.now()
        timestampStr = dateTimeObj.strftime("%Y%m")  # เช่น 202507
        prefix = "CALI"  # หรือจะใช้ 'CALI' ก็ได้ แล้วแต่ระบบคุณ
        # ดึงเลขล่าสุดของเดือนนี้
        cur.execute("""
            SELECT COALESCE(MAX(SUBSTRING(doc_no, 5)), '0')::bigint AS doc_no
            FROM ic_trans
            WHERE doc_format_code = 'CALI'
              AND to_char(doc_date, 'YYYY-MM') = to_char(current_date, 'YYYY-MM')
        """)
        bil_no = cur.fetchone()
        if bil_no['doc_no'] == 0:
            running = prefix + timestampStr+"00001"
        else:
            running = prefix+str(bil_no['doc_no'] + 1)
        doc_no = running
        return doc_no
    


@app.route('/api/salehistory')
def sale_history():
    with getcursor() as cur:
        cur.execute("""select doc_date,doc_no,case when trans_flag=34 then 'ລໍຖ້າຊຳລະເງິນ' when trans_flag=44 and doc_success=0 then 'ຊຳລະເງິນເເລ້ວ' else 'ຮັບເຄືອງແລ້ວ' end as status,
                        (select count(item_code) from ic_trans_detail where doc_no=a.doc_no) as count_item,total_amount_2,sum_point,
                        (SELECT json_agg(row) FROM (
                        select item_code,item_name,qty,unit_code,price,discount,sum_amount from ic_trans_detail where doc_no=a.doc_no
                        ) row) AS bill_detail
                        from ic_trans a where cust_code=%s""",(request.args.get('usercode'),))
        sale_history = cur.fetchall()
    return jsonify({"data": sale_history})
@app.route('/api/salehistory/<id>/receive', methods=['PUT'])
def sale_history_receive(id):
    with getcursor() as cur:
        cur.execute("UPDATE ic_trans SET doc_success = 1 WHERE doc_no = %s", (id,))
    return jsonify({"success": True, "message": "successful"}), 200


@app.route('/api')
def index():
    return jsonify({"message": "Welcome to the API"})

@app.route("/api/transport/bill/<bill_no>")
def get_bill_detail(bill_no):
    with getcursor() as cur:
        cur.execute("""
            SELECT 
                a.doc_no,
                a.doc_date,
                a.bill_no,
                b.bill_date,
                c.name_1 AS car,
                d.name_1 AS driver,
                a.url_img,
                (
                    SELECT json_agg(row) FROM (
                        SELECT 
                            to_char(create_date_time_now,'DD-MM-YYYY') AS doc_date,
                            to_char(create_date_time_now,'HH24:MI') AS doc_time,
                            'ຈັດຖ້ຽວແລ້ວ' AS status,
                            '' AS remark
                        FROM odg_tms_detail 
                        WHERE recipt_job IS NULL AND bill_no = a.bill_no

                        UNION ALL

                        SELECT 
                            to_char(recipt_job,'DD-MM-YYYY') AS doc_date,
                            to_char(recipt_job,'HH24:MI') AS doc_time,
                            'ຮັບຖ້ຽວ ແລະ ຈັດເຄື່ອງ' AS status,
                            '' AS remark
                        FROM odg_tms_detail 
                        WHERE recipt_job IS NOT NULL AND bill_no = a.bill_no

                        UNION ALL

                        SELECT 
                            to_char(sent_start,'DD-MM-YYYY') AS doc_date,
                            to_char(sent_start,'HH24:MI') AS doc_time,
                            'ເລີ່ມຈັດສົ່ງ' AS status,
                            '' AS remark
                        FROM odg_tms_detail 
                        WHERE sent_start IS NOT NULL AND bill_no = a.bill_no

                        UNION ALL

                        SELECT 
                            to_char(sent_end,'DD-MM-YYYY') AS doc_date,
                            to_char(sent_end,'HH24:MI') AS doc_time,
                            CASE 
                                WHEN status = 2 THEN 'ຍົກເລີກຈັດສົ່ງ'
                                ELSE 'ຈັດສົ່ງສຳເລັດ'
                            END AS status,
                            remark
                        FROM odg_tms_detail 
                        WHERE sent_end IS NOT NULL AND bill_no = a.bill_no
                    ) row
                ) AS list
            FROM odg_tms_detail a
            LEFT JOIN odg_tms b ON b.doc_no = a.doc_no
            LEFT JOIN odg_tms_car c ON c.code = a.car
            LEFT JOIN odg_tms_driver d ON d.code = b.driver
            WHERE a.bill_no = %s
            LIMIT 1
        """, (bill_no,))
        row = cur.fetchone()
        if row:
            return jsonify({"success": True, "data": dict(row)})
        else:
            return jsonify({"success": False, "message": "ບໍ່ພົບຂໍ້ມູນ"}), 404


@app.route("/api/promotion-points")
def get_promotion_points():
    with getcursor() as cur:
        cur.execute("""
            SELECT 
                ic_code,
                name_1,
                point_promotion::numeric,
                card_type,
                (
                    SELECT url_image 
                    FROM product_image 
                    WHERE ic_code = a.ic_code 
                      AND line_number = 1
                    LIMIT 1
                ) AS url_image
            FROM odg_pomotion_point a
            WHERE a.status = 0 
              AND current_date BETWEEN from_date AND to_date
            ORDER BY point_promotion::numeric ASC
        """)
        rows = cur.fetchall()
        result = [dict(row) for row in rows]
        return jsonify({"success": True, "data": result})

if __name__ == '__main__':
    app.run(port=5000,host='0.0.0.0', debug=True)
