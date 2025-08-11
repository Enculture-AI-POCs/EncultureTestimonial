import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { CheckCircle, AlertCircle, BarChart3, LogOut, X } from "lucide-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AdminDashboard from "./components/AdminDashboard";
import DashboardPage from "./components/DashboardPage";
import LoginPage from "./components/LoginPage";
import "./App.css";

function ProtectedRoute({ children, user, onLogin, onLogout }) {
  if (!user) {
    return <LoginPage onLogin={onLogin} />;
  }

  return (
    <div>
      <div className="auth-header">
        <div className="user-info">
          <span>Welcome, {user.name}</span>
        </div>
        <button onClick={onLogout} className="logout-btn">
          <LogOut size={16} />
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}

function SurveyForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    question2: "",
    question3: [],
    question4: "",
    question5: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showDialog, setShowDialog] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelect = (option) => {
    setFormData((prev) => ({
      ...prev,
      question3: prev.question3.includes(option)
        ? prev.question3.filter((item) => item !== option)
        : [...prev.question3, option],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "question3") {
          // Handle array data for question3
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (photo) {
        formDataToSend.append("photo", photo);
      }

      const response = await axios.post("/api/survey", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({
        type: "success",
        text: "Survey submitted successfully! Thank you for your feedback.",
      });
      setShowDialog(true);

      // Reset form
      setFormData({
        name: "",
        email: "",
        question2: "",
        question3: [],
        question4: "",
        question5: "",
      });
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error("Error submitting survey:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.error ||
          "Failed to submit survey. Please try again.",
      });
      setShowDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
    setMessage({ type: "", text: "" });

    // If it was a success message, scroll to top for new form
    if (message.type === "success") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isFormValid = () => {
    const nameValid = formData.name.trim() !== "";
    const emailValid = formData.email.trim() !== "";
    const question2Valid = formData.question2.trim() !== "";
    const question3Valid = formData.question3.length > 0;
    const question4Valid = formData.question4.trim() !== "";
    const question5Valid = formData.question5 !== "";
    // Photo is now optional - removed photoValid check

    // Debug logging
    console.log("Form Validation Debug:", {
      name: formData.name,
      nameValid,
      email: formData.email,
      emailValid,
      question2: formData.question2,
      question2Valid,
      question3: formData.question3,
      question3Valid,
      question4: formData.question4,
      question4Valid,
      question5: formData.question5,
      question5Valid,
      photo: photo,
      photoValid: "Optional",
    });

    return (
      nameValid &&
      emailValid &&
      question2Valid &&
      question3Valid &&
      question4Valid &&
      question5Valid
      // Removed photoValid from validation
    );
  };

  return (
    <div className="container">
      <div className="survey-container">
        <div className="survey-header">
          <div className="logo-section">
            <img
              src={process.env.PUBLIC_URL + "/NamanLogo.png"}
              alt="NamanHR Logo"
              className="header-logo"
            />
          </div>
        </div>
        <div className="header-new">
          <h1> Testimonial Survey * NamanHR</h1>
          <p>
            You've been part of our story — now we'd love to feature you in it.
            Just a few quick questions, and you might just land yourself a cameo
            on our brand-new website (with credits, ofcourse)!!!
          </p>
        </div>

        {/* Dialog Modal */}
        {showDialog && (
          <div className="dialog-overlay" onClick={closeDialog}>
            <div
              className="dialog-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dialog-header">
                <button className="dialog-close" onClick={closeDialog}>
                  <X size={20} />
                </button>
              </div>
              <div className="dialog-body">
                <div
                  className={`dialog-icon ${
                    message.type === "success" ? "success" : "error"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle size={40} />
                  ) : (
                    <AlertCircle size={40} />
                  )}
                </div>
                <h3 className="dialog-title">
                  {message.type === "success" ? "Success!" : "Error"}
                </h3>
                <p className="dialog-message">{message.text}</p>
              </div>
              <div className="dialog-footer">
                <button className="dialog-btn" onClick={closeDialog}>
                  {message.type === "success" ? "Thank You!" : "Try Again"}
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">
              1. Let's start with the basics — what's your name? *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter your email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="question2">
              2. What's your title + the amazing place you call work? *
            </label>
            <textarea
              id="question2"
              name="question2"
              value={formData.question2}
              onChange={handleInputChange}
              required
              placeholder="Tell us about your role and workplace..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="question2">
              3. What kind of awesome did we create together? (Select all that
              apply) *
            </label>
            <div className="checkbox-group two-columns">
              {[
                "Leadership Development",
                "Talent Assessment",
                "Assessment and Development Centre",
                "Strength Based Development",
                "Competency Mapping",
                "Executive Coaching",
                "Learning Design & Delivery",
                "Performance Management System (PMS)",
                "OD & Culture Change",
                "Climate Survey",
                "Other",
              ].map((option) => (
                <label
                  key={option}
                  className="checkbox-label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.question3.includes(option)}
                    onChange={() => handleMultiSelect(option)}
                  />
                  <span className="checkmark height-fix"></span>
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="question4">
              4. What was it like working with the NamanHR crew? (You can be
              honest. We can take it 😄) *
            </label>
            <textarea
              id="question4"
              name="question4"
              value={formData.question4}
              onChange={handleInputChange}
              required
              placeholder="Was it the people? The energy? The clarity? A breakthrough moment? We'd love to hear what made the difference..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="question5">
              5. Cool if we put your name, title, and this quote on our website?
              (With your photo too — only if you say yes) *
            </label>
            <div className="radio-group">
              {[
                "Yes, go for it!",
                "I'd rather not — keeping it between us",
                "Sure, but show me before you post",
              ].map((option) => (
                <label
                  key={option}
                  className="radio-label"
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="question5"
                    value={option}
                    checked={formData.question5 === option}
                    onChange={handleInputChange}
                  />
                  <span className="radiomark"></span>
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Upload a Photo (Optional)</label>
            <div
              {...getRootProps()}
              className={`photo-upload ${isDragActive ? "dragover" : ""}`}
            >
              <input {...getInputProps()} />
              {photoPreview ? (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <p>Photo uploaded successfully!</p>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <p>📸 Click or drag a photo here (Optional)</p>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#999",
                      marginTop: "5px",
                    }}
                  >
                    Supports: JPG, PNG, GIF (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Survey"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on app load
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Redirect to home page after logout
    navigate("/");
  };

  return (
    <Routes>
      <Route path="/" element={<SurveyForm />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
          >
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
