import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question1: '',
    question2: '',
    question3: [],
    question4: '',
    question5: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (option) => {
    setFormData(prev => ({
      ...prev,
      question3: prev.question3.includes(option)
        ? prev.question3.filter(item => item !== option)
        : [...prev.question3, option]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'question3') {
          // Handle array data for question3
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      const response = await axios.post('/api/survey', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage({ type: 'success', text: 'Survey submitted successfully! Thank you for your feedback.' });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        question1: '',
        question2: '',
        question3: '',
        question4: '',
        question5: ''
      });
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error submitting survey:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to submit survey. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' && 
           formData.email.trim() !== '' && 
           formData.question1.trim() !== '' && 
           formData.question2.trim() !== '' && 
           formData.question3.length > 0 && 
           formData.question4.trim() !== '' && 
           formData.question5 !== '' && 
           photo;
  };

  return (
    <div className="container">
      <div className="survey-container">
        <div className="survey-header">
          <h1>📝 Testimonial Survey</h1>
          <p>Share your experience with us! Please answer the following questions and upload a photo.</p>
        </div>

        {message.text && (
          <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span style={{ marginLeft: '10px' }}>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Let's start with the basics — what's your name? *</label>
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
            <label htmlFor="question1">What's your title + the amazing place you call work? *</label>
            <textarea
              id="question1"
              name="question1"
              value={formData.question1}
              onChange={handleInputChange}
              required
              placeholder="Tell us about your role and workplace..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="question2">What kind of awesome did we create together? (Select all that apply) *</label>
            <div className="checkbox-group">
              {[
                'Leadership Development',
                'Talent Assessment',
                'Assessment and Development Centre',
                'Strength Based Development',
                'Competency Mapping',
                'Executive Coaching',
                'Learning Design & Delivery',
                'Performance Management System (PMS)',
                'OD & Culture Change',
                'Climate Survey',
                'Other'
              ].map((option) => (
                <label key={option} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.question3.includes(option)}
                    onChange={() => handleMultiSelect(option)}
                  />
                  <span className="checkmark"></span>
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="question4">What was it like working with the NamanHR crew? (You can be honest. We can take it 😄) *</label>
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
            <label htmlFor="question5">Cool if we put your name, title, and this quote on our website? (With your photo too — only if you say yes) *</label>
            <div className="radio-group">
              {[
                'Yes, go for it!',
                'I\'d rather not — keeping it between us',
                'Sure, but show me before you post'
              ].map((option) => (
                <label key={option} className="radio-label">
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
            <label>Upload a Photo *</label>
            <div 
              {...getRootProps()} 
              className={`photo-upload ${isDragActive ? 'dragover' : ''}`}
            >
              <input {...getInputProps()} />
              {photoPreview ? (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <p style={{ marginTop: '10px', color: '#667eea' }}>
                    <CheckCircle size={16} style={{ marginRight: '5px' }} />
                    Photo uploaded successfully!
                  </p>
                </div>
              ) : (
                <div>
                  {isDragActive ? (
                    <div>
                      <Upload size={48} color="#667eea" />
                      <p style={{ marginTop: '10px', color: '#667eea' }}>Drop the photo here...</p>
                    </div>
                  ) : (
                    <div>
                      <Camera size={48} color="#667eea" />
                      <p style={{ marginTop: '10px', color: '#667eea' }}>
                        Drag & drop a photo here, or click to select
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '5px' }}>
                        Supports: JPG, PNG, GIF (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading"></span>
                Submitting...
              </>
            ) : (
              'Submit Survey'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App; 