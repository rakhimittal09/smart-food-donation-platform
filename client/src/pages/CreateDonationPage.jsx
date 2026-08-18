import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import FoodCard from '../components/FoodCard';
import { PlusCircle, ArrowLeft, Image, Clock, MapPin, Sparkles } from 'lucide-react';

const CreateDonationPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [formData, setFormData] = useState({
    foodName: '',
    description: '',
    category: 'Cooked Meals',
    quantity: 25,
    unit: 'servings',
    foodType: 'Veg',
    preparationDate: new Date().toISOString().split('T')[0],
    expiryDate: tomorrow.toISOString().split('T')[0],
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '04:00 PM - 07:00 PM',
    pickupAddress: user?.address || '',
    city: user?.city || 'New Delhi',
    state: user?.state || 'Delhi',
    pincode: user?.pincode || '110001',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
    specialInstructions: 'Packaged in hygienic food-grade containers. Ready for immediate pickup.',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.foodName || !formData.description || !formData.city) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (new Date(formData.expiryDate) < new Date(formData.pickupDate)) {
      setError('Expiry date cannot precede pickup date.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let payload;
      if (imageFile) {
        payload = new FormData();
        Object.keys(formData).forEach((key) => {
          payload.append(key, formData[key]);
        });
        payload.append('imageFile', imageFile);
      } else {
        payload = formData;
      }

      const res = await donationService.createDonation(payload);
      if (res.success) {
        showToast('success', 'Food donation listed successfully! Thank you for sharing.');
        navigate('/donor-dashboard');
      }
    } catch (err) {
      console.error('Failed to create donation:', err);
      setError(err.response?.data?.message || 'Failed to list donation. Please verify fields.');
    } finally {
      setLoading(false);
    }
  };

  // Construct mock preview object for real-time visualization
  const previewDonation = {
    ...formData,
    _id: 'preview',
    status: 'Available',
    donor: user,
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Surplus Redistribution
            </span>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
              List New Food Donation
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Provide clear details to help NGOs quickly evaluate and collect your meals.
            </p>
          </div>

          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--rose-50)',
              color: 'var(--rose-600)',
              border: '1px solid var(--rose-200)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </div>
        )}

        {/* 2-Column Grid: Form + Live Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* Form */}
          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label className="form-label">Food Title / Item Name *</label>
                <input
                  type="text"
                  name="foodName"
                  className="form-input"
                  value={formData.foodName}
                  onChange={handleChange}
                  placeholder="e.g. 50 Plates Hyderabadi Veg Biryani"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description *</label>
                <textarea
                  rows="3"
                  name="description"
                  className="form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe meal contents, freshness, preparation background, dietary specs..."
                  required
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity *</label>
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
                  <label className="form-label">Unit *</label>
                  <select name="unit" className="form-select" value={formData.unit} onChange={handleChange}>
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Food Type *</label>
                  <select name="foodType" className="form-select" value={formData.foodType} onChange={handleChange}>
                    <option value="Veg">🌱 Vegetarian</option>
                    <option value="Non-Veg">🍗 Non-Vegetarian</option>
                    <option value="Vegan">🥬 Vegan</option>
                    <option value="Egg">🥚 Egg</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date *</label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="form-input"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Pickup Date *</label>
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
                  <label className="form-label">Pickup Time Slot *</label>
                  <input
                    type="text"
                    name="pickupTime"
                    className="form-input"
                    value={formData.pickupTime}
                    onChange={handleChange}
                    placeholder="e.g. 05:00 PM - 08:00 PM"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Pickup Address *</label>
                <input
                  type="text"
                  name="pickupAddress"
                  className="form-input"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder="Street / Banquet / Kitchen address"
                  required
                />
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-input"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New Delhi"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-input"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Delhi"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-input"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="110001"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Instructions & Handling Notes</label>
                <textarea
                  rows="2"
                  name="specialInstructions"
                  className="form-textarea"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  placeholder="Refrigeration needs, container requirements, entrance instructions..."
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Upload Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-input"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Or Image URL (Optional)</label>
                  <input
                    type="url"
                    name="image"
                    className="form-input"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ width: '100%', marginTop: '1.25rem' }}
              >
                {loading ? 'Publishing Food Listing...' : 'Publish Food Listing'}
              </button>
            </form>
          </div>

          {/* Live Preview Card */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <Sparkles size={16} style={{ color: 'var(--primary-600)' }} /> Real-Time Live Listing Preview:
            </div>

            <FoodCard donation={previewDonation} />
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default CreateDonationPage;
