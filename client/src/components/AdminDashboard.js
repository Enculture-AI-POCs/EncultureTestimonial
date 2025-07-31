import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Trash2, Download, Search, Filter } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSurveys();
    fetchStatistics();
  }, [currentPage, searchTerm]);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/surveys?page=${currentPage}&limit=10&search=${searchTerm}`);
      setSurveys(response.data.surveys);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('/api/statistics');
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleDelete = async (surveyId) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        await axios.delete(`/api/surveys/${surveyId}`);
        fetchSurveys();
        fetchStatistics();
      } catch (error) {
        console.error('Error deleting survey:', error);
        alert('Failed to delete survey');
      }
    }
  };

  const handleViewSurvey = (survey) => {
    setSelectedSurvey(survey);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Title & Workplace', 'Services Used', 'Experience', 'Permission', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...surveys.map(survey => [
        `"${survey.name}"`,
        `"${survey.email}"`,
        `"${survey.question2}"`,
        `"${survey.question3.join(', ')}"`,
        `"${survey.question4}"`,
        `"${survey.question5}"`,
        `"${formatDate(survey.submittedAt)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `surveys-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Survey Admin Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={exportToCSV} className="export-btn">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {statistics && (
        <div className="statistics-grid">
          <div className="stat-card">
            <h3>Total Surveys</h3>
            <p className="stat-number">{statistics.totalSurveys}</p>
          </div>
          <div className="stat-card">
            <h3>Today's Surveys</h3>
            <p className="stat-number">{statistics.todaySurveys}</p>
          </div>
          <div className="stat-card">
            <h3>Most Popular Service</h3>
            <p className="stat-number">
              {statistics.serviceStats[0]?.count || 0} - {statistics.serviceStats[0]?._id || 'N/A'}
            </p>
          </div>
        </div>
      )}

      <div className="search-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search surveys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="surveys-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Services</th>
              <th>Permission</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey._id}>
                <td>{survey.name}</td>
                <td>{survey.email}</td>
                <td>
                  <div className="services-tags">
                    {survey.question3.slice(0, 2).map((service, index) => (
                      <span key={index} className="service-tag">
                        {service}
                      </span>
                    ))}
                    {survey.question3.length > 2 && (
                      <span className="service-tag more">+{survey.question3.length - 2}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`permission-badge ${survey.question5.includes('Yes') ? 'approved' : 'pending'}`}>
                    {survey.question5}
                  </span>
                </td>
                <td>{formatDate(survey.submittedAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleViewSurvey(survey)}
                      className="view-btn"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(survey._id)}
                      className="delete-btn"
                      title="Delete Survey"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="page-btn"
        >
          Previous
        </button>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          Next
        </button>
      </div>

      {/* Survey Detail Modal */}
      {showModal && selectedSurvey && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Survey Details</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="survey-detail">
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
                  <strong>Services Used:</strong>
                  <div className="services-list">
                    {selectedSurvey.question3.map((service, index) => (
                      <span key={index} className="service-item">{service}</span>
                    ))}
                  </div>
                </div>
                <div className="detail-row">
                  <strong>Experience:</strong> {selectedSurvey.question4}
                </div>
                <div className="detail-row">
                  <strong>Permission:</strong> {selectedSurvey.question5}
                </div>
                <div className="detail-row">
                  <strong>Submitted:</strong> {formatDate(selectedSurvey.submittedAt)}
                </div>
                {selectedSurvey.photoUrl && (
                  <div className="detail-row">
                    <strong>Photo:</strong>
                    <img 
                      src={selectedSurvey.photoUrl} 
                      alt="Survey photo" 
                      className="survey-photo"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 