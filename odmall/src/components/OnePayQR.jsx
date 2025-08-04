import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle } from 'lucide-react';

const OnePayQR = ({ orderId, totalAmount, onPayment, onClose }) => {
  const qrRef = useRef(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.pubnub.com/sdk/javascript/pubnub.4.27.3.js';
    script.onload = () => {
      const onePayScript = document.createElement('script');
      onePayScript.src = './onepay.js';
      onePayScript.onload = initOnePay;
      document.body.appendChild(onePayScript);
    };
    document.body.appendChild(script);

    function initOnePay() {
      const mcid = 'mch667bdd4aaf07a';
      const shopcode = 'tCpJN9pvOwYD';
      const uuid = orderId;
      const onePay = new window.OnePay(mcid);
      onePay.debug = true;

      onePay.getCode(
        {
          transactionid: uuid,
          invoiceid: orderId,
          terminalid: '001',
          amount: 1,
          description: `Odienmall_Order: ${orderId}`,
          expiretime: 5,
        },
        (code) => {
          if (qrRef.current) {
            qrRef.current.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${code}`;
          }
        }
      );

      const subParams = { uuid, shopcode: null, tid: null };
      onePay.subscribe(subParams, (res) => {
        if (res.uuid === uuid) {
          setSuccess(true);
          onPayment('transfer');
          // 🔒 ปิด Modal ทันที
          if (onClose) onClose();
        }
      });
    }
  }, [orderId, totalAmount, onPayment, onClose]);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4">
      {/* QR or Success */}
      {success ? (
        <div className="flex flex-col items-center justify-center space-y-3 animate-fade-in">
          <CheckCircle className="text-green-500 w-20 h-20" />
          <p className="text-lg font-semibold text-green-600">ຊຳລະເງິນສຳເລັດ!</p>
        </div>
      ) : (
        <>
          <div
            id="qrcode"
            className="border-4 border-dashed border-red-400 rounded-xl p-2 bg-white shadow-lg"
          >
            <img
              ref={qrRef}
              className="rounded-md"
              alt="QR Code"
            />
          </div>
          <p className="text-gray-600 text-sm">
            ສະແກນ QR ດ້ວຍ <span className="font-bold text-blue-600">BCEL One</span> ເພື່ອຊຳລະ
          </p>
        </>
      )}

      <p className="text-xs text-gray-400 italic">
        (ກະລຸນາເປີດໜ້ານີ້ຄ້າງໄວ້ ຈົນກວ່າຈະຊຳລະເງິນສຳເລັດ)
      </p>
    </div>
  );
};

export default OnePayQR;
