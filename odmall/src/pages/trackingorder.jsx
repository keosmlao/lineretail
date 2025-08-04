import React, { useState } from 'react';
import { ArrowLeft, Search, Package2, Truck, MapPin, Clock, CheckCircle2, Circle, Phone, MessageCircle, Share2, Bell } from 'lucide-react';
import { useNavigate } from "react-router-dom";
const TrackingOrder = () => {
  const [trackingNumber, setTrackingNumber] = useState('LX789456123LA');
  const [activeTab, setActiveTab] = useState('tracking');
  const navigate = useNavigate();

  const orderData = {
    orderNumber: 'LX789456123LA',
    productName: 'iPhone 15 Pro Max 256GB',
    productImage: '/api/placeholder/80/80',
    status: 'out_for_delivery',
    estimatedDelivery: '2025-08-01',
    deliveryTime: '14:00 - 16:00',
    courierName: 'ທ້າວ ບຸນມີ ວົງສະຫວັນ',
    courierPhone: '+856 20 9876 5432',
    currentLocation: 'ຫ່າງຈາກທ່ານ 2.5 ກິໂລແມັດ',
    recipient: {
      name: 'ນາງ ສົມສີ ພັນນະວົງ',
      address: 'ບ້ານ ດອນນອກ, ເມືອງ ສີໂຄດຕະບອງ, ນະຄອນຫຼວງວຽງຈັນ',
      phone: '+856 20 1234 5678'
    },
    timeline: [
      {
        id: 1,
        status: 'ordered',
        title: 'ສັ່ງຊື້ສຳເລັດ',
        description: 'ລາຍການສັ່ງຊື້ຖືກສ້າງແລ້ວ',
        date: '28 ກໍລະກົດ',
        time: '14:30',
        completed: true,
        location: 'ອອນໄລນ໌'
      },
      {
        id: 2,
        status: 'confirmed',
        title: 'ຢືນຢັນການສັ່ງຊື້',
        description: 'ການຊຳລະເງິນສຳເລັດແລ້ວ',
        date: '28 ກໍລະກົດ',
        time: '15:45',
        completed: true,
        location: 'ຮ້ານຄ້າ Vientiane Mall'
      },
      {
        id: 3,
        status: 'preparing',
        title: 'ກະກຽມສິນຄ້າ',
        description: 'ກຳລັງຫຸ້ມຫໍ່ແລະກະກຽມສົ່ງ',
        date: '29 ກໍລະກົດ',
        time: '10:20',
        completed: true,
        location: 'ສູນກະຈາຍສິນຄ້າ'
      },
      {
        id: 4,
        status: 'shipped',
        title: 'ອອກເດີນທາງແລ້ວ',
        description: 'ສິນຄ້າອອກຈາກສູນກະຈາຍ',
        date: '30 ກໍລະກົດ',
        time: '09:15',
        completed: true,
        location: 'ສູນກະຈາຍ ວຽງຈັນ'
      },
      {
        id: 5,
        status: 'out_for_delivery',
        title: 'ກຳລັງສົ່ງມອບ',
        description: 'ຄູຂົນສົ່ງກຳລັງມາສົ່ງໃຫ້ທ່ານ',
        date: '31 ກໍລະກົດ',
        time: '12:30',
        completed: true,
        location: 'ຫ່າງຈາກທ່ານ 2.5 ກມ',
        isActive: true
      },
      {
        id: 6,
        status: 'delivered',
        title: 'ສົ່ງມອບສຳເລັດ',
        description: 'ລູກຄ້າໄດ້ຮັບສິນຄ້າແລ້ວ',
        date: '1 ສິງຫາ',
        time: '--:--',
        completed: false,
        location: 'ບ້ານຂອງທ່ານ'
      }
    ]
  };

  const getStatusColor = (status, completed, isActive) => {
    if (completed) return 'bg-emerald-500';
    if (isActive) return 'bg-blue-500 animate-pulse';
    return 'bg-gray-300';
  };

  const getStatusIcon = (status, completed, isActive) => {
    if (completed) return <CheckCircle2 className="w-5 h-5 text-white" />;
    if (isActive) return <Circle className="w-5 h-5 text-white fill-current" />;
    return <Circle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)} // ✅ กลับหน้าก่อนหน้า
                className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">ຕິດຕາມພັດສະດຸ</h1>
                <p className="text-xs text-gray-500">#{orderData.orderNumber}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Product Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-white/50 p-5">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              <Package2 className="w-8 h-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">{orderData.productName}</h3>
              <p className="text-xs text-gray-500 mt-1">ສັ່ງມື້ວານນີ້ເວລາ 14:30</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-600">ກຳລັງສົ່ງມອບ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">ກຳລັງສົ່ງມາຫາທ່ານ</h3>
              <p className="text-blue-100 text-sm">{orderData.currentLocation}</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-100">ຄາດວ່າຈະມາເຖິງ</span>
              <span className="font-bold">ມື້ນີ້ {orderData.deliveryTime}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 w-4/5 animate-pulse"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold">ຄູ</span>
              </div>
              <div>
                <p className="font-medium text-sm">{orderData.courierName}</p>
                <p className="text-xs text-blue-100">ຄູຂົນສົ່ງ</p>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">ໂທ</span>
            </button>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-white/50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mt-1">
              <MapPin className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">ທີ່ຢູ່ການສົ່ງ</h4>
              <p className="text-gray-700 text-sm font-medium">{orderData.recipient.name}</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{orderData.recipient.address}</p>
              <p className="text-gray-500 text-xs mt-2">{orderData.recipient.phone}</p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-white/50 p-5">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            ປະຫວັດການຂົນສົ່ງ
          </h3>

          <div className="space-y-4">
            {orderData.timeline.map((item, index) => (
              <div key={item.id} className="flex gap-4">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(item.status, item.completed, item.isActive)}`}>
                    {getStatusIcon(item.status, item.completed, item.isActive)}
                  </div>
                  {index < orderData.timeline.length - 1 && (
                    <div className={`w-0.5 h-8 mt-2 ${item.completed ? 'bg-emerald-200' : 'bg-gray-200'}`}></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-semibold text-sm ${item.isActive ? 'text-blue-600' : item.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                      {item.title}
                    </h4>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{item.date}</p>
                      <p className="text-xs text-gray-400">{item.time}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>



        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white rounded-2xl shadow-sm border border-white/50 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">ແຊັດກັບຄູສົ່ງ</span>
          </button>

          <button className="bg-white rounded-2xl shadow-sm border border-white/50 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-gray-700">ໂທຫາສູນບໍລິການ</span>
          </button>
        </div>

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default TrackingOrder;