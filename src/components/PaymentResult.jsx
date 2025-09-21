
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000/api" });

const PaymentResult = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const handlePaymentResult = async () => {
      const params = new URLSearchParams(window.location.search);
      const paymentStatus = params.get("payment");
      const feeId = params.get("feeId");
      const userType = params.get("userType") || "student"; // default to student
      
      // Get user role from token for proper navigation
      const token = localStorage.getItem('token');
      let userRole = userType; // fallback to userType from URL
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          userRole = decoded.user.role?.toLowerCase() || userType;
        } catch (error) {
          console.error("Token decode error:", error);
          // If token is invalid, still try to navigate based on userType
        }
      }

      // Update fee status if payment was successful
      if (paymentStatus === "success" && feeId) {
        try {
          await api.put(`/fees/${feeId}`, { status: "PAID" });
        } catch (e) {
          console.error("Error updating fee status:", e);
          // Continue regardless of error
        }
      }

      // Show appropriate message
      const message = paymentStatus === "success" 
        ? "Payment successful!" 
        : "Payment cancelled or failed.";
      alert(message);

      // Navigate to appropriate dashboard
      let redirectPath = "/login"; // default fallback
      
      if (userRole === "parent") {
        redirectPath = "/parent/dashboard";
      } else if (userRole === "student") {
        redirectPath = "/student/dashboard";
      } else if (userRole === "teacher") {
        redirectPath = "/teacher/dashboard";
      } else if (userRole === "admin") {
        redirectPath = "/admin/dashboard";
      }

      navigate(redirectPath, { replace: true });
    };

    // Small delay to ensure component is mounted
    const timeoutId = setTimeout(handlePaymentResult, 100);
    
    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Processing payment result...
    </div>
  );
};

export default PaymentResult;
