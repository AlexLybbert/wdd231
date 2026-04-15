import { initMobileMenu } from './modules/navigation.js';
import { storage } from './modules/storage.js';

const formState = {
    isSubmitting: false,
    submissions: []
};

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initForm();
    loadRecentSubmissions();
});

function initForm() {
    const form = document.getElementById('vendorForm');
    const submitAnotherBtn = document.getElementById('submitAnother');

    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });

        form.addEventListener('submit', handleSubmit);

        form.addEventListener('reset', () => {
            clearAllErrors();
            setTimeout(() => {
                document.getElementById('vendorName').focus();
            }, 100);
        });
    }

    if (submitAnotherBtn) {
        submitAnotherBtn.addEventListener('click', () => {
            document.getElementById('successMessage').style.display = 'none';
            document.getElementById('vendorForm').style.display = 'block';
            document.getElementById('vendorForm').reset();
            clearAllErrors();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function validateField(field) {
    const fieldName = field.name;
    const value = field.value.trim();
    let errorMessage = '';

    clearFieldError(field);

    if (field.hasAttribute('required') && !value) {
        errorMessage = 'This field is required';
    } else {
        errorMessage = validateTypedField(fieldName, field.type, value);
    }

    if (errorMessage) {
        showFieldError(field, errorMessage);
    }

    return errorMessage === '';
}

function validateTypedField(fieldName, fieldType, value) {
    if (!value) {
        return '';
    }

    const typeValidators = {
        email: (input) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input) ? '' : 'Please enter a valid email address';
        },
        tel: (input) => {
            const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
            return phoneRegex.test(input) ? '' : 'Please use format: 555-555-5555';
        },
        url: (input) => {
            try {
                new URL(input);
                return '';
            } catch {
                return 'Please enter a valid URL (e.g., https://example.com)';
            }
        }
    };

    const nameValidators = {
        zipCode: (input) => {
            const zipRegex = /^\d{5}$/;
            return zipRegex.test(input) ? '' : 'ZIP code must be 5 digits';
        },
        state: (input) => (input.length === 2 ? '' : 'State must be 2 letters (e.g., OR)')
    };

    const typeValidator = typeValidators[fieldType];
    if (typeValidator) {
        return typeValidator(value);
    }

    const nameValidator = nameValidators[fieldName];
    if (nameValidator) {
        return nameValidator(value);
    }

    return '';
}

function validateSustainability() {
    const checkboxes = document.querySelectorAll('input[name="sustainability"]');
    const checked = Array.from(checkboxes).some(cb => cb.checked);
    
    const errorElement = document.getElementById('sustainabilityError');
    
    if (!checked) {
        errorElement.textContent = 'Please select at least one sustainability feature';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = document.getElementById(`${field.name}Error`);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function clearAllErrors() {
    const form = document.getElementById('vendorForm');
    if (form) {
        form.querySelectorAll('.error').forEach(field => {
            field.classList.remove('error');
        });
        form.querySelectorAll('.error-message').forEach(error => {
            error.textContent = '';
        });
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    if (formState.isSubmitting) {
        return;
    }

    const form = e.target;
    let isValid = true;

    const fields = form.querySelectorAll('input:not([type="checkbox"]), select, textarea');
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    if (!validateSustainability()) {
        isValid = false;
    }

    if (!isValid) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
        return;
    }

    const formData = collectFormData(form);

    formState.isSubmitting = true;
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        saveSubmission(formData);
        const queryString = new URLSearchParams(new FormData(form)).toString();
        globalThis.location.href = `submission.html?${queryString}`;

    } catch (error) {
        console.error('Submission error:', error);
        alert('An error occurred. Please try again.');
    } finally {
        formState.isSubmitting = false;
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

function collectFormData(form) {
    const data = {
        vendorName: form.vendorName.value.trim(),
        category: form.category.value,
        address: form.address.value.trim(),
        city: form.city.value.trim(),
        state: form.state.value.trim().toUpperCase(),
        zipCode: form.zipCode.value.trim(),
        phone: form.phone.value.trim(),
        website: form.website.value.trim(),
        hours: form.hours.value.trim(),
        sustainability: Array.from(form.querySelectorAll('input[name="sustainability"]:checked'))
            .map(cb => cb.value),
        description: form.description.value.trim(),
        yourName: form.yourName.value.trim(),
        yourEmail: form.yourEmail.value.trim(),
        submittedAt: new Date().toISOString()
    };

    return data;
}

function saveSubmission(submission) {
    try {
        const submissions = getSubmissions();
        
        submissions.unshift(submission);
        
        const trimmedSubmissions = submissions.slice(0, 10);
        
        storage.set('foodstead_submissions', trimmedSubmissions);
        
        formState.submissions = trimmedSubmissions;
    } catch (error) {
        console.error('Error saving submission:', error);
    }
}

function getSubmissions() {
    try {
        return storage.get('foodstead_submissions', []);
    } catch (error) {
        console.error('Error loading submissions:', error);
        return [];
    }
}

function loadRecentSubmissions() {
    const container = document.getElementById('recentSubmissions');
    
    if (!container) {
        return;
    }

    const submissions = getSubmissions();

    if (submissions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666;">No submissions yet. Be the first to contribute!</p>';
        return;
    }

    const submissionsHTML = submissions.map(submission => {
        const date = new Date(submission.submittedAt);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const sustainabilityIcons = {
            'local': '🌍',
            'organic': '🌿',
            'seasonal': '🍂',
            'zero-waste': '♻️'
        };

        const sustainabilityHTML = submission.sustainability
            .map(tag => sustainabilityIcons[tag] || '')
            .join(' ');

        return `
            <article class="submission-card">
                <h4>${submission.vendorName}</h4>
                <p><strong>${formatCategory(submission.category)}</strong></p>
                <p>${submission.city}, ${submission.state}</p>
                <p>${sustainabilityHTML}</p>
                <p class="submission-meta">Submitted by ${submission.yourName} on ${formattedDate}</p>
            </article>
        `;
    }).join('');

    container.innerHTML = submissionsHTML;
}

function formatCategory(category) {
    const categories = {
        'farmers-market': "Farmers' Market",
        'csa': 'CSA Program',
        'coop': 'Food Co-op',
        'restaurant': 'Restaurant'
    };
    return categories[category] || category;
}
