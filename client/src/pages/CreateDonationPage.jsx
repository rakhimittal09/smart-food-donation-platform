import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationService } from '../services/donationService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DashboardLayout from '../components/DashboardLayout';
import {
  PlusCircle, ArrowLeft, ArrowRight, Check, Trash2, Package, Truck, MapPin, Eye,
  ShieldCheck, RefreshCw, UserX, Search, Building2, HelpCircle, Clock, Thermometer,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'Cooked Food', icon: '🍲', label: 'Cooked Food' },
  { value: 'Wheat/Flour', icon: '🌾', label: 'Wheat / Flour' },
  { value: 'Rice & Grains', icon: '🍚', label: 'Rice & Grains' },
  { value: 'Pulses', icon: '🫘', label: 'Pulses' },
  { value: 'Fruits & Vegetables', icon: '🥦', label: 'Fruits & Vegetables' },
  { value: 'Packaged/Grocery Items', icon: '📦', label: 'Packaged / Grocery' },
  { value: 'Bakery Items', icon: '🍞', label: 'Bakery Items' },
  { value: 'Other', icon: '🍱', label: 'Other' },
];

const UNITS = [
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'grams', label: 'Grams (g)' },
  { value: 'litres', label: 'Litres (L)' },
  { value: 'packets', label: 'Packets' },
  { value: 'bags', label: 'Bags' },
  { value: 'pieces', label: 'Pieces' },
  { value: 'meals', label: 'Meals' },
  { value: 'boxes', label: 'Boxes' },
  { value: 'servings', label: 'Servings' },
];

const DONATION_METHODS = [
  { value: 'ngo_pickup', icon: <Building2 size={20} />, label: 'NGO / Volunteer Pickup', desc: 'An NGO or volunteer comes to collect the food from your location' },
  { value: 'self_delivery', icon: <Truck size={20} />, label: 'Self-Delivery', desc: 'You deliver the food directly to an NGO or food bank' },
  { value: 'arrange_pickup', icon: <Package size={20} />, label: 'Arrange Pickup', desc: 'Request a pickup partner to collect and deliver' },
  { value: 'choose_ngo', icon: <Search size={20} />, label: 'Choose Nearby NGO', desc: 'Select a specific NGO from our network in your area' },
  { value: 'need_help', icon: <HelpCircle size={20} />, label: 'Need Help Deciding', desc: 'Our system will recommend the best option for you' },
];

const TIME_SLOTS = [
  '06:00 AM - 09:00 AM', '09:00 AM - 12:00 PM', '12:00 PM - 03:00 PM',
  '03:00 PM - 06:00 PM', '06:00 PM - 09:00 PM',
];

const STEPS = [
  { label: 'Food Items', icon: Package },
  { label: 'Details', icon: Eye },
  { label: 'Method', icon: Truck },
  { label: 'Pickup', icon: MapPin },
  { label: 'Review', icon: Check },
];

const CreateDonationPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Step 1: Food Items
  const [items, setItems] = useState([
    { itemName: '', category: 'Cooked Food', quantity: '', unit: 'kg' },
  ]);

  // Step 2: Food Details
  const [details, setDetails] = useState({
    foodType: 'Veg',
    preparationDate: new Date().toISOString().split('T')[0],
    expiryDate: tomorrow.toISOString().split('T')[0],
    specialInstructions: '',
    image: '',
    storageType: '',
    temperatureControlled: false,
    allergens: '',
    certifications: '',
  });
  const [imageFile, setImageFile] = useState(null);

  // Step 3: Donation Method
  const [donationMethod, setDonationMethod] = useState('ngo_pickup');

  // Step 4: Pickup/Delivery
  const [pickup, setPickup] = useState({
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '03:00 PM - 06:00 PM',
    pickupAddress: user?.address || '',
    deliveryAddress: '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
    contactName: user?.name || '',
    contactPhone: user?.phone || '',
  });

  // Step 5: Additional options
  const [options, setOptions] = useState({
    isRecurring: false,
    recurringFrequency: '',
    isAnonymous: false,
  });

  // --- Item Handlers ---
  const addItem = () => {
    setItems([...items, { itemName: '', category: 'Cooked Food', quantity: '', unit: 'kg' }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  // --- Navigation ---
  const canGoNext = () => {
    if (step === 0) {
      return items.every((it) => it.itemName.trim() && it.quantity > 0);
    }
    if (step === 1) {
      return details.expiryDate;
    }
    if (step === 3) {
      return pickup.pickupAddress && pickup.city && pickup.state && pickup.pincode && pickup.pickupDate && pickup.pickupTime;
    }
    return true;
  };

  const nextStep = () => {
    if (canGoNext() && step < STEPS.length - 1) {
      setStep(step + 1);
      setError('');
    } else if (!canGoNext()) {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      setError('');
    }
  };

  // --- Submit ---
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const primaryItem = items[0];
      const totalQuantity = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
      const foodName = items.length === 1
        ? primaryItem.itemName
        : `${primaryItem.itemName} + ${items.length - 1} more item${items.length > 2 ? 's' : ''}`;
      const description = items.map((it) => `${it.itemName} (${it.quantity} ${it.unit})`).join(', ');

      const formPayload = {
        foodName,
        description: details.specialInstructions ? `${description}. ${details.specialInstructions}` : description,
        category: primaryItem.category,
        quantity: totalQuantity,
        unit: primaryItem.unit,
        items: items.map((it) => ({
          itemName: it.itemName,
          category: it.category,
          quantity: Number(it.quantity),
          unit: it.unit,
        })),
        foodType: details.foodType,
        preparationDate: details.preparationDate,
        expiryDate: details.expiryDate,
        donationMethod,
        pickupDate: pickup.pickupDate,
        pickupTime: pickup.pickupTime,
        pickupAddress: pickup.pickupAddress,
        deliveryAddress: pickup.deliveryAddress,
        city: pickup.city,
        state: pickup.state,
        pincode: pickup.pincode,
        contactName: pickup.contactName,
        contactPhone: pickup.contactPhone,
        specialInstructions: details.specialInstructions,
        image: details.image,
        isRecurring: options.isRecurring,
        recurringFrequency: options.recurringFrequency,
        isAnonymous: options.isAnonymous,
        foodSafetyDetails: {
          storageType: details.storageType,
          temperatureControlled: details.temperatureControlled,
          allergens: details.allergens,
          certifications: details.certifications,
        },
      };

      let payload;
      if (imageFile) {
        payload = new FormData();
        Object.keys(formPayload).forEach((key) => {
          if (typeof formPayload[key] === 'object' && !(formPayload[key] instanceof Date)) {
            payload.append(key, JSON.stringify(formPayload[key]));
          } else {
            payload.append(key, formPayload[key]);
          }
        });
        payload.append('imageFile', imageFile);
      } else {
        payload = formPayload;
      }

      const res = await donationService.createDonation(payload);
      if (res.success) {
        showToast('success', `Donation listed! Tracking ID: ${res.data.donationId}`);
        navigate('/donor-dashboard');
      }
    } catch (err) {
      console.error('Failed to create donation:', err);
      setError(err.response?.data?.message || 'Failed to list donation. Please verify all fields.');
    } finally {
      setLoading(false);
    }
  };

  // --- Step Rendering ---
  const cardStyle = { padding: '2rem' };
  const sectionTitle = (text) => (
    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-main)' }}>{text}</h3>
  );

  const renderStep0 = () => (
    <div className="card" style={cardStyle}>
      {sectionTitle('What food are you donating?')}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Add one or more food items with their category, quantity, and unit.
      </p>

      {items.map((item, idx) => (
        <div key={idx} style={{
          border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          padding: '1.25rem', marginBottom: '1rem', background: 'var(--bg-main)',
          position: 'relative',
        }}>
          {items.length > 1 && (
            <button onClick={() => removeItem(idx)} style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose-500)',
            }}>
              <Trash2 size={16} />
            </button>
          )}
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', marginBottom: '0.75rem' }}>
            Item {idx + 1}
          </div>
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              type="text" className="form-input" placeholder="e.g. Wheat flour, Rice, Biryani"
              value={item.itemName} onChange={(e) => updateItem(idx, 'itemName', e.target.value)} required
            />
          </div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={item.category} onChange={(e) => updateItem(idx, 'category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number" min="0.1" step="0.1" className="form-input" placeholder="e.g. 10"
                value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select className="form-select" value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)}>
                {UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button type="button" onClick={addItem} className="btn btn-outline" style={{ width: '100%', gap: '0.5rem' }}>
        <PlusCircle size={18} /> Add Another Item
      </button>
    </div>
  );

  const renderStep1 = () => (
    <div className="card" style={cardStyle}>
      {sectionTitle('Food Details & Safety')}

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Food Type *</label>
          <select className="form-select" value={details.foodType} onChange={(e) => setDetails({ ...details, foodType: e.target.value })}>
            <option value="Veg">🌱 Vegetarian</option>
            <option value="Non-Veg">🍗 Non-Vegetarian</option>
            <option value="Vegan">🥬 Vegan</option>
            <option value="Egg">🥚 Egg</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Preparation Date</label>
          <input type="date" className="form-input" value={details.preparationDate} onChange={(e) => setDetails({ ...details, preparationDate: e.target.value })} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Expiry Date *</label>
        <input type="date" className="form-input" value={details.expiryDate} onChange={(e) => setDetails({ ...details, expiryDate: e.target.value })} required />
      </div>

      {/* Food Safety */}
      <div style={{
        border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
        padding: '1.25rem', marginTop: '0.5rem', marginBottom: '1.25rem', background: 'var(--bg-main)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={18} style={{ color: 'var(--primary-600)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Food Safety Details</span>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>(Optional)</span>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Storage Type</label>
            <select className="form-select" value={details.storageType} onChange={(e) => setDetails({ ...details, storageType: e.target.value })}>
              <option value="">Select storage type</option>
              <option value="room_temperature">🌡️ Room Temperature</option>
              <option value="refrigerated">❄️ Refrigerated</option>
              <option value="frozen">🧊 Frozen</option>
              <option value="hot">🔥 Hot / Freshly Cooked</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Temperature Controlled?</label>
            <select className="form-select" value={details.temperatureControlled ? 'yes' : 'no'} onChange={(e) => setDetails({ ...details, temperatureControlled: e.target.value === 'yes' })}>
              <option value="no">No</option>
              <option value="yes">Yes — maintained cold/hot chain</option>
            </select>
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Allergens</label>
            <input type="text" className="form-input" placeholder="e.g. Nuts, Dairy, Gluten" value={details.allergens} onChange={(e) => setDetails({ ...details, allergens: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Certifications</label>
            <input type="text" className="form-input" placeholder="e.g. FSSAI, Organic" value={details.certifications} onChange={(e) => setDetails({ ...details, certifications: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Special Instructions / Handling Notes</label>
        <textarea rows="2" className="form-textarea" placeholder="Refrigeration needs, container requirements, entrance instructions..." value={details.specialInstructions} onChange={(e) => setDetails({ ...details, specialInstructions: e.target.value })} />
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Upload Photo</label>
          <input type="file" accept="image/*" className="form-input" onChange={(e) => { if (e.target.files?.[0]) setImageFile(e.target.files[0]); }} />
        </div>
        <div className="form-group">
          <label className="form-label">Or Image URL</label>
          <input type="url" className="form-input" placeholder="https://..." value={details.image} onChange={(e) => setDetails({ ...details, image: e.target.value })} />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="card" style={cardStyle}>
      {sectionTitle('How do you want to donate?')}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Choose the method that works best for you.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {DONATION_METHODS.map((method) => (
          <button
            key={method.value}
            type="button"
            onClick={() => setDonationMethod(method.value)}
            style={{
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)',
              border: `2px solid ${donationMethod === method.value ? 'var(--primary-500)' : 'var(--border-color)'}`,
              background: donationMethod === method.value ? 'var(--primary-50)' : '#ffffff',
              cursor: 'pointer', textAlign: 'left',
              transition: 'all 150ms ease',
            }}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: donationMethod === method.value ? 'var(--primary-600)' : 'var(--bg-main)',
              color: donationMethod === method.value ? '#fff' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms ease',
            }}>
              {method.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{method.label}</div>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{method.desc}</div>
            </div>
            {donationMethod === method.value && (
              <Check size={20} style={{ marginLeft: 'auto', color: 'var(--primary-600)', flexShrink: 0 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="card" style={cardStyle}>
      {sectionTitle(donationMethod === 'self_delivery' ? 'Delivery Details' : 'Pickup Details')}

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">{donationMethod === 'self_delivery' ? 'Delivery' : 'Pickup'} Date *</label>
          <input type="date" className="form-input" value={pickup.pickupDate} onChange={(e) => setPickup({ ...pickup, pickupDate: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Time Slot *</label>
          <select className="form-select" value={pickup.pickupTime} onChange={(e) => setPickup({ ...pickup, pickupTime: e.target.value })}>
            {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{donationMethod === 'self_delivery' ? 'Pickup From' : 'Pickup'} Address *</label>
        <input type="text" className="form-input" placeholder="Street / Building / Landmark" value={pickup.pickupAddress} onChange={(e) => setPickup({ ...pickup, pickupAddress: e.target.value })} required />
      </div>

      {donationMethod === 'self_delivery' && (
        <div className="form-group">
          <label className="form-label">Delivery To Address</label>
          <input type="text" className="form-input" placeholder="NGO / Food bank address" value={pickup.deliveryAddress} onChange={(e) => setPickup({ ...pickup, deliveryAddress: e.target.value })} />
        </div>
      )}

      <div className="form-grid-3">
        <div className="form-group">
          <label className="form-label">City *</label>
          <input type="text" className="form-input" placeholder="New Delhi" value={pickup.city} onChange={(e) => setPickup({ ...pickup, city: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">State *</label>
          <input type="text" className="form-input" placeholder="Delhi" value={pickup.state} onChange={(e) => setPickup({ ...pickup, state: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Pincode *</label>
          <input type="text" className="form-input" placeholder="110001" value={pickup.pincode} onChange={(e) => setPickup({ ...pickup, pincode: e.target.value })} required />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Contact Name</label>
          <input type="text" className="form-input" value={pickup.contactName} onChange={(e) => setPickup({ ...pickup, contactName: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Contact Phone</label>
          <input type="tel" className="form-input" value={pickup.contactPhone} onChange={(e) => setPickup({ ...pickup, contactPhone: e.target.value })} />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const totalQty = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);
    const methodLabel = DONATION_METHODS.find((m) => m.value === donationMethod)?.label || donationMethod;

    return (
      <div className="card" style={cardStyle}>
        {sectionTitle('Review & Confirm Your Donation')}

        {/* Additional options */}
        <div style={{
          border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          padding: '1.25rem', marginBottom: '1.5rem', background: 'var(--bg-main)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input type="checkbox" checked={options.isRecurring} onChange={(e) => setOptions({ ...options, isRecurring: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }} />
              <RefreshCw size={16} style={{ color: 'var(--primary-600)' }} /> Recurring Donation
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              <input type="checkbox" checked={options.isAnonymous} onChange={(e) => setOptions({ ...options, isAnonymous: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-600)' }} />
              <UserX size={16} style={{ color: 'var(--amber-600)' }} /> Donate Anonymously
            </label>
          </div>
          {options.isRecurring && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Frequency</label>
              <select className="form-select" value={options.recurringFrequency} onChange={(e) => setOptions({ ...options, recurringFrequency: e.target.value })}>
                <option value="">Select frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Items Summary */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary-50)', padding: '0.75rem 1.25rem', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-800)' }}>
              🍱 Food Items ({items.length})
            </div>
            {items.map((item, i) => (
              <div key={i} style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.itemName}</span>
                <span style={{ color: 'var(--text-muted)' }}>{item.quantity} {item.unit} · {item.category}</span>
              </div>
            ))}
            <div style={{ padding: '0.75rem 1.25rem', fontWeight: 700, fontSize: '0.9rem', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Quantity</span>
              <span>{totalQty} {items[0]?.unit}</span>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Food Type', value: details.foodType },
              { label: 'Expiry Date', value: new Date(details.expiryDate).toLocaleDateString() },
              { label: 'Donation Method', value: methodLabel },
              { label: 'Pickup Date', value: new Date(pickup.pickupDate).toLocaleDateString() },
              { label: 'Time Slot', value: pickup.pickupTime },
              { label: 'City', value: pickup.city },
              { label: 'Contact', value: pickup.contactName },
              { label: 'Phone', value: pickup.contactPhone },
            ].map((r, i) => (
              <div key={i} style={{ padding: '0.65rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{r.label}</div>
                <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '0.15rem' }}>{r.value || '—'}</div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {options.isRecurring && <span className="badge badge-scheduled">🔄 Recurring ({options.recurringFrequency})</span>}
            {options.isAnonymous && <span className="badge badge-pending">🕶️ Anonymous</span>}
            {details.storageType && <span className="badge badge-available">🌡️ {details.storageType.replace('_', ' ')}</span>}
          </div>
        </div>
      </div>
    );
  };

  const stepRenderers = [renderStep0, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              New Donation
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Create Food Donation
            </h1>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            <ArrowLeft size={16} /> Cancel
          </button>
        </div>

        {/* Step Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '0', overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem' }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;
            return (
              <React.Fragment key={i}>
                <button
                  onClick={() => { if (i <= step) setStep(i); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    background: 'none', border: 'none', cursor: i <= step ? 'pointer' : 'default',
                    padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)',
                    color: isActive ? 'var(--primary-700)' : isDone ? 'var(--primary-500)' : 'var(--text-light)',
                    fontWeight: isActive ? 700 : 500, fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: isDone ? 'var(--primary-500)' : isActive ? 'var(--primary-600)' : 'var(--bg-main)',
                    color: isDone || isActive ? '#fff' : 'var(--text-light)',
                    fontSize: '0.7rem', fontWeight: 700,
                    border: `2px solid ${isDone ? 'var(--primary-500)' : isActive ? 'var(--primary-600)' : 'var(--border-color)'}`,
                  }}>
                    {isDone ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="wizard-step-label">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: '2px', background: isDone ? 'var(--primary-400)' : 'var(--border-color)', margin: '0 0.25rem', minWidth: '16px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'var(--rose-50)', color: 'var(--rose-600)', border: '1px solid var(--rose-200)',
            borderRadius: 'var(--radius-md)', padding: '0.85rem 1.25rem', fontSize: '0.9rem', marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="animate-fade-in" key={step}>
          {stepRenderers[step]()}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', gap: '1rem' }}>
          {step > 0 ? (
            <button onClick={prevStep} className="btn btn-secondary" style={{ gap: '0.4rem' }}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}

          {step < STEPS.length - 1 ? (
            <button onClick={nextStep} className="btn btn-primary" style={{ gap: '0.4rem' }} disabled={!canGoNext()}>
              Continue <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-primary btn-lg" disabled={loading} style={{ gap: '0.5rem' }}>
              {loading ? 'Publishing...' : '🎉 Publish Donation'}
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateDonationPage;
