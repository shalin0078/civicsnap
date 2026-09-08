import { useState } from 'react';
import { 
  X, 
  Upload, 
  ArrowLeft,
  MapPin, 
  Trash2, 
  Car,
  Lightbulb,
  Droplets,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Brush,
  HelpCircle,
  Locate,
  Check
} from 'lucide-react';
import './CreateComplaint.css';

import { useToast } from './Toast';

const categories = [
  { id: '1', name: 'Potholes', description: 'Road potholes, asphalt erosion, and sinkholes', icon: AlertTriangle },
  { id: '2', name: 'Garbage & Waste Dumps', description: 'Overflowing bins, scattered refuse, and trash heaps', icon: Trash2 },
  { id: '3', name: 'Illegal Parking', description: 'Obstruction of sidewalks, gates, and bike lanes', icon: Car },
  { id: '4', name: 'Streetlight Problems', description: 'Defective lights, dark stretches, and loose wires', icon: Lightbulb },
  { id: '5', name: 'Water Supply & Pipeline Leakage', description: 'Burst pipes, contaminated water, and low pressure', icon: Droplets },
  { id: '6', name: 'Road & Infrastructure Defects', description: 'Damaged footpaths, broken railings, and open manholes', icon: ShieldAlert },
  { id: '7', name: 'Cleanliness & Sweeping', description: 'Unswept streets and accumulated street litter', icon: Brush },
  { id: '8', name: 'Open Waste Burning', description: 'Burning of plastics, dry leaves, and trash in open areas', icon: Flame },
  { id: '9', name: 'Other Civic Issues', description: 'Any other neighborhood maintenance or public hazard', icon: HelpCircle },
];

const priorityLevels = [
  { id: 'Low', label: 'Low Priority', desc: 'Minor cosmetic or non-blocking issues' },
  { id: 'Medium', label: 'Medium Priority', desc: 'Normal civic issue requiring municipal attention' },
  { id: 'High', label: 'High Priority', desc: 'Active disruption to traffic or neighborhood hygiene' },
  { id: 'Emergency', label: 'Emergency', desc: 'Immediate safety or structural hazard' },
];

const CreateComplaint = ({ onClose, onSubmit, isGuestMode = false, initialCategory = null }) => {
  const [step, setStep] = useState(initialCategory ? 2 : 1);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: initialCategory || '',
    category: initialCategory || '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    priority: 'Medium',
    photo_url: '',
    guest_name: '',
    guest_contact: '',
    is_guest: isGuestMode
  });

  const handleCategorySelect = (categoryName) => {
    setFormData((prev) => ({ 
      ...prev, 
      category: categoryName, 
      title: categoryName 
    }));
    setStep(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrioritySelect = (priority) => {
    setFormData((prev) => ({ ...prev, priority }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check max file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit. Please choose a smaller image.', 'error', 'File Too Large');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, photo_url: reader.result }));
      showToast('Evidence photograph attached.', 'success', 'Photo Attached');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, photo_url: '' }));
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocationSuccess(false);

    if (!navigator.geolocation) {
      fallbackDefaultLocation('Browser lacks geolocation API');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const formattedCoords = `GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          location: prev.location ? `${prev.location} (${formattedCoords})` : formattedCoords
        }));

        setIsLocating(false);
        setLocationSuccess(true);
        showToast(`GPS pinned at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, 'success', 'Location Detected');
      },
      (error) => {
        console.warn('Geolocation error:', error);
        fallbackDefaultLocation(error.message);
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  };

  const fallbackDefaultLocation = (reason) => {
    // Default civic center coordinates when GPS is unavailable
    const lat = 28.6139;
    const lng = 77.2090;
    const formatted = `GPS: ${lat}, ${lng} (Municipal Ward 12)`;
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: prev.location ? `${prev.location} (${formatted})` : formatted
    }));
    setIsLocating(false);
    setLocationSuccess(true);
    showToast('Municipal coordinates pinned for report triage.', 'info', 'GPS Assigned');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.location.trim()) {
      showToast('Please provide a landmark or location for field dispatch.', 'warning', 'Location Required');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      showToast('Civic issue registered and dispatched to municipal portal.', 'success', 'Report Submitted');
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Failed to register report. Please check connection.', 'error', 'Submission Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCategorySelection = () => (
    <div className="category-selection">
      <header className="mobile-header">
        <div className="header-top">
          <button className="icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={22} />
          </button>
          <h2 className="header-title">Select Issue Category</h2>
        </div>
        <p className="header-subtitle">
          {isGuestMode ? 'Guest Reporting Mode: Choose the type of civic problem' : 'Choose the category of problem you wish to report'}
        </p>
      </header>

      <div className="category-list">
        {categories.map((cat) => {
          const IconComponent = cat.icon;
          return (
            <button 
              key={cat.id} 
              type="button"
              className="category-item" 
              onClick={() => handleCategorySelect(cat.name)}
            >
              <div className="category-icon-wrapper">
                <IconComponent size={22} className="category-icon-svg" />
              </div>
              <div className="category-info">
                <span className="category-name">{cat.name}</span>
                <span className="category-description">{cat.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="details-form">
      <header className="mobile-header">
        <div className="header-top">
          <button className="icon-btn" onClick={() => setStep(1)} aria-label="Go back">
            <ArrowLeft size={22} />
          </button>
          <h2 className="header-title">Provide Report Details</h2>
        </div>
        <p className="header-subtitle">{formData.category}</p>
      </header>
      
      <form onSubmit={handleSubmit} className="complaint-form">
        {/* Photo Upload with Preview */}
        <div className="form-group image-upload-group">
          <label className="form-label">Evidence Photograph</label>
          {imagePreview ? (
            <div className="image-preview-box">
              <img src={imagePreview} alt="Evidence preview" className="preview-img" />
              <button 
                type="button" 
                className="btn-remove-preview"
                onClick={handleRemoveImage}
              >
                <X size={16} />
                Remove Photo
              </button>
            </div>
          ) : (
            <label className="image-upload-label">
              <Upload size={28} className="upload-icon" />
              <span className="upload-title">Upload Evidence Photo</span>
              <span className="upload-hint">PNG, JPG, or JPEG up to 5MB</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden-input" 
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {/* Location & GPS */}
        <div className="form-group">
          <div className="label-with-action">
            <label htmlFor="location" className="form-label">Location / Landmark *</label>
            <button 
              type="button" 
              className={`btn-locate ${locationSuccess ? 'active' : ''}`}
              onClick={handleDetectLocation}
              disabled={isLocating}
            >
              {locationSuccess ? <Check size={14} /> : <Locate size={14} />}
              <span>{isLocating ? 'Detecting GPS...' : locationSuccess ? 'GPS Attached' : 'Auto-Detect GPS'}</span>
            </button>
          </div>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="E.g., Near City Park North Gate, Pillar 42"
            required
          />
        </div>

        {/* Priority Selector */}
        <div className="form-group">
          <label className="form-label">Urgency / Priority Level</label>
          <div className="priority-chips">
            {priorityLevels.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`priority-chip ${p.id.toLowerCase()} ${formData.priority === p.id ? 'selected' : ''}`}
                onClick={() => handlePrioritySelect(p.id)}
              >
                <span className="priority-name">{p.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description of Problem</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail to help the municipal team dispatch appropriate equipment..."
            rows={3}
          ></textarea>
        </div>

        {/* Guest Reporting Info (if in guest mode) */}
        {isGuestMode && (
          <div className="guest-info-section">
            <span className="guest-info-title">Guest Contact Details (Optional)</span>
            <div className="guest-inputs-grid">
              <input
                type="text"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleChange}
                placeholder="Your Name"
              />
              <input
                type="text"
                name="guest_contact"
                value={formData.guest_contact}
                onChange={handleChange}
                placeholder="Phone or Email for updates"
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-submit full-width interactive-hover" 
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? 'Submitting Civic Report...' : 'Submit Civic Report'}</span>
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {step === 1 ? renderCategorySelection() : renderDetailsForm()}
      </div>
    </div>
  );
};

export default CreateComplaint;
