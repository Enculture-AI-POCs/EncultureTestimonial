import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Download, Trash2, BarChart3, Users, FileText, Calendar, TrendingUp, Activity } from 'lucide-react';
import './AdminDashboard.css';

function DashboardPage() {
  const [surveys, setSurveys] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const surveysPerPage = 10;

  const fetchSurveys = useCallback(async () => {
    try {
      const response = await axios.get(`/api/surveys?page=${currentPage}&limit=${surveysPerPage}&search=${searchTerm}`);
      setSurveys(response.data.surveys);
      setTotalPages(Math.ceil(response.data.total / surveysPerPage));
    } catch (error) {
      console.error('Error fetching surveys:', error);
    }
  }, [currentPage, searchTerm]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await axios.get('/api/statistics');
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
    fetchStatistics();
  }, [fetchSurveys, fetchStatistics]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSurveys();
  };

  const handleArchive = async (surveyId) => {
    if (!window.confirm('Are you sure you want to archive this survey?')) return;
    
    setDeleteLoading(surveyId);
    try {
      await axios.delete(`/api/surveys/${surveyId}`);
      fetchSurveys();
      fetchStatistics();
    } catch (error) {
      console.error('Error archiving survey:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  // const handleViewDetails = (survey) => {
  //   setSelectedSurvey(survey);
  //   setShowModal(true);
  // };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Title & Workplace', 'Services', 'Experience', 'Permission', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...surveys.map(survey => [
        `"${survey.name}"`,
        `"${survey.email}"`,
        `"${survey.question2}"`,
        `"${survey.question3.join(', ')}"`,
        `"${survey.question4}"`,
        `"${survey.question5}"`,
        `"${new Date(survey.submittedAt).toLocaleString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">
              <BarChart3 size={28} />
            </div>
            <div>
              <h1>Survey Analytics</h1>
              <p>Monitor and manage survey submissions</p>
            </div>
          </div>
          <div className="header-actions">
            <button onClick={exportToCSV} className="export-btn">
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{statistics.totalSubmissions || 0}</h3>
            <p>Total Submissions</p>
            <span className="stat-trend positive">
              <TrendingUp size={14} />
              +12% this week
            </span>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>{statistics.thisMonth || 0}</h3>
            <p>This Month</p>
            <span className="stat-trend positive">
              <Activity size={14} />
              +8% vs last month
            </span>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3>{statistics.today || 0}</h3>
            <p>Today's Submissions</p>
            <span className="stat-trend neutral">
              <Activity size={14} />
              Real-time data
            </span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search surveys by name, email, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>
      </div>

            {/* Surveys Cards */}
      <div className="cards-container">
        <div className="cards-header">
          <h2>Recent Submissions</h2>
          <span className="cards-count">{surveys.length} surveys</span>
        </div>
        
        <div className="survey-cards">
          {surveys.map((survey) => (
            <div key={survey._id} className="survey-card">
              <div className="card-header">
                <div className="card-avatar">
                  {survey.photoData ? (
                    <img 
                      src={survey.photoData} 
                      alt={`${survey.name}`}
                      className="avatar-image"
                    />
                  ) : (
                    <span className="avatar-text">
                      {survey.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="card-info">
                  <h3 className="card-name">{survey.name}</h3>
                  <p className="card-email">{survey.email}</p>
                </div>
                <div className="card-actions">
                  <button
                    onClick={() => handleArchive(survey._id)}
                    className="archive-btn"
                    disabled={deleteLoading === survey._id}
                    title="Archive"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="card-content">
                <div className="card-section">
                  <label>What's your title + the amazing place you call work?</label>
                  <p>{survey.question2}</p>
                </div>
                
                <div className="card-section">
                  <label>What kind of awesome did we create together?</label>
                  <div className="services-tags">
                    {survey.question3.map((service, index) => (
                      <span key={index} className="service-tag">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="card-section">
                  <label>What was it like working with the NamanHR crew?</label>
                  <p className="experience-text">{survey.question4}</p>
                </div>
                
                <div className="card-section">
                  <label>Cool if we put your name, title, and this quote on our website?</label>
                  <p>{survey.question5}</p>
                </div>
              </div>
              
              <div className="card-footer">
                <span className="submission-date">
                  {new Date(survey.submittedAt).toLocaleDateString()} at {new Date(survey.submittedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal for Survey Details */}
      {showModal && selectedSurvey && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Survey Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <strong>Name:</strong> {selectedSurvey.name}
              </div>
              <div className="detail-row">
                <strong>Email:</strong> {selectedSurvey.email}
              </div>
              <div className="detail-row">
                <strong>Title & Workplace:</strong> {selectedSurvey.question2}
              </div>
              <div className="detail-row">
                <strong>Services:</strong> {selectedSurvey.question3.join(', ')}
              </div>
              <div className="detail-row">
                <strong>Experience:</strong> {selectedSurvey.question4}
              </div>
              <div className="detail-row">
                <strong>Permission:</strong> {selectedSurvey.question5}
              </div>
              <div className="detail-row">
                <strong>Submitted:</strong> {new Date(selectedSurvey.submittedAt).toLocaleString()}
              </div>
              {selectedSurvey.photoData && (
                <div className="detail-row">
                  <strong>Photo:</strong>
                  <img 
                    src={selectedSurvey.photoData} 
                    alt="Survey participant" 
                    style={{ maxWidth: '200px', marginTop: '10px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardPage; 