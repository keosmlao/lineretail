import { useEffect, useState } from "react";
import { Search, Plus, Trash2, AlertCircle, CheckCircle, Users, Menu } from "lucide-react";
import api from "../api";
import Navbar from "../components/Navbar";
// Navbar Component


// Loading Spinner Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );
}

// Alert Component
function Alert({ type, message, onClose }) {
  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  
  return (
    <div className={`${bgColor} border-l-4 p-4 mb-4 rounded-r-lg ${textColor}`}>
      <div className="flex items-center">
        <Icon className="mr-2" size={20} />
        <span>{message}</span>
        <button onClick={onClose} className="ml-auto text-lg font-bold">×</button>
      </div>
    </div>
  );
}

// Assignment Card Component
function AssignmentCard({ assignment, onUnassign }) {
  const hasMenu = assignment.rich_menu_id;
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Users className="text-purple-600 mr-2" size={20} />
            <h3 className="font-semibold text-gray-900">{assignment.group_name}</h3>
          </div>
          {hasMenu && (
            <button
              onClick={() => onUnassign(assignment.group_id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
              title="ยกเลิกการกำหนด"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        
        {hasMenu ? (
          <div>
            <div className="flex items-center mb-3">
              <Menu className="text-green-600 mr-2" size={16} />
              <span className="text-sm text-gray-600">Rich Menu: {assignment.rich_menu_name}</span>
            </div>
            {assignment.image_path && (
              <div className="bg-gray-100 rounded-lg p-2">
                <img
                  src={`http://localhost:5000/${assignment.image_path}`}
                  alt={assignment.rich_menu_name}
                  className="w-full h-auto rounded"
                />
              </div>
            )}
            <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="mr-1" size={12} />
              กำหนดแล้ว
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 text-sm">ยังไม่มีการกำหนด Rich Menu</p>
            <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              ยังไม่กำหนด
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AssignMenu() {
  const [groups, setGroups] = useState([]);
  const [menus, setMenus] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [groupsRes, menusRes, assignmentsRes] = await Promise.all([
        api.get("/api/groups"),
        api.get("/api/richmenus"),
        api.get("/api/groups-assign")
      ]);
      
      setGroups(groupsRes.data);
      setMenus(menusRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      showAlert('error', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const assign = async () => {
    if (!selectedGroup || !selectedMenu) {
      showAlert('error', 'กรุณาเลือกทั้ง Group และ Rich Menu');
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/assign", {
        group_id: selectedGroup,
        rich_menu_id: selectedMenu,
      });
      
      showAlert('success', 'กำหนด Rich Menu สำเร็จ!');
      setSelectedGroup("");
      setSelectedMenu("");
      fetchData();
    } catch (error) {
      showAlert('error', 'เกิดข้อผิดพลาดในการกำหนด Rich Menu');
    } finally {
      setSubmitting(false);
    }
  };

  const unassign = async (group_id) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะยกเลิกการกำหนด Rich Menu นี้?")) return;

    try {
      await api.delete(`/api/unassign/${group_id}`);
      showAlert('success', 'ยกเลิกการกำหนดสำเร็จ!');
      fetchData();
    } catch (error) {
      showAlert('error', 'เกิดข้อผิดพลาดในการยกเลิกการกำหนด');
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.group_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assignment.rich_menu_name && assignment.rich_menu_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canAssign = selectedGroup && selectedMenu && !submitting;

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          {/* Assignment Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center mb-6">
              <Plus className="text-purple-600 mr-3" size={24} />
              <h1 className="text-2xl font-bold text-gray-900">กำหนด Rich Menu ให้กับ Group</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือก Group
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">-- เลือก Group --</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  เลือก Rich Menu
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={selectedMenu}
                  onChange={(e) => setSelectedMenu(e.target.value)}
                >
                  <option value="">-- เลือก Rich Menu --</option>
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={assign}
                disabled={!canAssign}
                className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  canAssign
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    กำลังบันทึก...
                  </div>
                ) : (
                  <>
                    <CheckCircle className="inline mr-2" size={16} />
                    กำหนด
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assignments List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
                รายการการกำหนด Rich Menu ({assignments.length})
              </h2>
              
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ค้นหา Group หรือ Menu..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ยังไม่มีการกำหนด Rich Menu'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.group_id}
                    assignment={assignment}
                    onUnassign={unassign}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AssignMenu;