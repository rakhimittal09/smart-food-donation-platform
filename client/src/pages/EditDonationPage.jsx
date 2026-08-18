import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

const EditDonationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isDonor, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Cooked Meals',
    'Packaged Food',
    'Fruits & Vegetables',
    'Bakery & Bread',
    'Dairy & Beverages',
    'Grains & Pulses',
  ];

  const units = ['servings', 'meals', 'kg', 'boxes', 'packets', 'litres'];

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const res = await donationService.getDonationById(id);
        if (res.success && res.data) {
          const d = res.data;
          setFormData({
            foodName: d.foodName,
            description: d.description,
            category: d.category,
            quantity: d.quantity,
            unit: d.unit,
            foodType: d.foodType,
            expiryDate: d.expiryDate ? d.expiryDate.split('T')[0] : '',
            pickupDate: d.pickupDate ? d.pickupDate.split('T')[0] : '',
            pickupTime: d.pickupTime,
            pickupAddress: d.pickupAddress,
            city: d.city,
            state: d.state,
            pincode: d.pincode,
            specialInstructions: d.specialInstructions || '',
            image: d.image || '',
            status: d.status,
          });
        }
      } catch (err) {
        showToast('error', 'Unable to retrieve donation details.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id, navigate, showToast]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const res = await donationService.updateDonation(id, formData);
      if (res.success) {
        showToast('success', 'Donation updated successfully!');
        navigate(`/donations/${id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update donation.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage text="Loading listing editor..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Edit Food Listing</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Update information or change availability</p>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {error && (
          <div style={{ background: 'var(--rose-50)', color: 'var(--rose-600)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Food Title *</label>
              <input
                type="text"
                name="foodName"
                className="form-input"
                value={formData.foodName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                rows="3"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  min="1"
                  name="quantity"
                  className="form-input"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit</label>
                <select name="unit" className="form-select" value={formData.unit} onChange={handleChange}>
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Food Type</label>
                <select name="foodType" className="form-select" value={formData.foodType} onChange={handleChange}>
                  <option value="Veg">🌱 Veg</option>
                  <option value="Non-Veg">🍗 Non-Veg</option>
                  <option value="Vegan">🥬 Vegan</option>
                  <option value="Egg">🥚 Egg</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                  <option value="Available">Available</option>
                  <option value="Requested">Requested</option>
                  <option value="Approved">Approved</option>
                  <option value="Pickup Scheduled">Pickup Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Pickup Date</label>
                <input
                  type="date"
                  name="pickupDate"
                  className="form-input"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pickup Time Slot</label>
                <input
                  type="text"
                  name="pickupTime"
                  className="form-input"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Special Instructions</label>
              <textarea
                rows="2"
                name="specialInstructions"
                className="form-textarea"
                value={formData.specialInstructions}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
              style={{ width: '100%', marginTop: '1rem', gap: '0.5rem' }}
            >
              <Save size={18} /> {saving ? 'Saving Updates...' : 'Save Changes'}
            </button>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default EditDonationPage;
