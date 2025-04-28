// File: ./front/src/components/shared/pages/ContactPage.tsx
// Last change: Implemented contact form with validation and submission

import React, { useState } from 'react';
import './ContactPage.css';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Meno je povinné';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email je povinný';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Neplatný email';
      isValid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Predmet je povinný';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Správa je povinná';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Správa musí mať aspoň 10 znakov';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Server returned an error response');
      }

      const data = await response.json();
      
      setSubmitStatus('success');
      setStatusMessage('Vaša správa bola úspešne odoslaná. Ďakujeme za kontaktovanie.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setStatusMessage('Pri odosielaní správy nastala chyba. Skúste to prosím neskôr alebo nás kontaktujte emailom.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-info">
          <h1>Kontaktujte nás</h1>
          <p>Máte otázky o našich službách? Vyplňte kontaktný formulár a my sa vám čoskoro ozveme.</p>
          
          <div className="contact-details">
            <div className="contact-detail">
              <div className="contact-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>info@sendeliver.com</p>
              </div>
            </div>
            
            <div className="contact-detail">
              <div className="contact-icon">📞</div>
              <div>
                <h3>Telefón</h3>
                <p>+421 900 123 456</p>
              </div>
            </div>
            
            <div className="contact-detail">
              <div className="contact-icon">📍</div>
              <div>
                <h3>Adresa</h3>
                <p>Logistická 123, 831 04 Bratislava</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="contact-form-container">
          <form className="contact-form" onSubmit={handleSubmit}>
            {submitStatus === 'success' && (
              <div className="form-status success">
                {statusMessage}
              </div>
            )}
            
            {submitStatus === 'error' && (
              <div className="form-status error">
                {statusMessage}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="name">Meno</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'input-error' : ''}
                disabled={isSubmitting}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'input-error' : ''}
                disabled={isSubmitting}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Predmet</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? 'input-error' : ''}
                disabled={isSubmitting}
              />
              {errors.subject && <div className="error-message">{errors.subject}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Správa</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'input-error' : ''}
                disabled={isSubmitting}
              ></textarea>
              {errors.message && <div className="error-message">{errors.message}</div>}
            </div>
            
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Odosielam...' : 'Odoslať správu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;