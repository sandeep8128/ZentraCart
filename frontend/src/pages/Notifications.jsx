import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../services/api";
import Navbar from "../components/Navbar";
import socket from "../socket";

function Notifications() {
  const { token } = useSelector((state) => state.auth);

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(res.data.notifications);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.put(
        `/notifications/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      fetchNotifications();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  useEffect(() => {
    fetchNotifications();

    socket.on("newOrder", (data) => {
      alert(data.message);

      fetchNotifications();
    });

    return () => {
      socket.off("newOrder");
    };
  }, []);

  return (
    <>
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
  <h1 className="text-4xl font-bold text-[#285570] mb-8">
    Notifications 🔔
  </h1>

  {notifications.length === 0 ? (
    <div
      className="
      bg-white
      border
      border-[#CBCAC7]
      rounded-3xl
      p-10
      text-center
      shadow-sm
    "
    >
      <h3 className="text-2xl text-gray-500">
        No Notifications
      </h3>
    </div>
  ) : (
    <div className="space-y-4">
      {notifications.map((item) => (
        <div
          key={item._id}
          className={`
          rounded-3xl
          border
          p-6
          shadow-sm
          transition-all
          ${
            item.isRead
              ? "bg-white border-[#CBCAC7]"
              : "bg-[#EDF6FF] border-[#285570]"
          }
        `}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3
                className="
                text-xl
                font-bold
                text-[#285570]
                mb-2
              "
              >
                {item.title}
              </h3>

              <p className="text-gray-600 mb-3">
                {item.message}
              </p>

              <span
                className={`
                text-sm
                font-medium
                ${
                  item.isRead
                    ? "text-green-600"
                    : "text-orange-500"
                }
              `}
              >
                {item.isRead
                  ? "✅ Read"
                  : "🔔 Unread"}
              </span>
            </div>

            {!item.isRead && (
              <button
                onClick={() =>
                  markAsRead(item._id)
                }
                className="
                bg-[#285570]
                text-white
                px-4
                py-2
                rounded-xl
                hover:bg-[#1E4257]
                transition
              "
              >
                Mark As Read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
    </>
  );
}

export default Notifications;
