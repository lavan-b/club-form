document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registration-form");
  const fields = {
    firstName: document.getElementById("first-name"),
    lastName: document.getElementById("last-name"),
    dob: document.getElementById("dob"),
    username: document.getElementById("username"),
    regNumber: document.getElementById("reg-number"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    gender: document.getElementsByName("gender"),
    terms: document.getElementById("terms"),
  };

  const passwordToggle = document.getElementsByClassName("password-toggle")[0];
  let passwordIsValid = false;

  Object.values(fields).forEach((field) => {
    if (field && field.tagName) field.required = true;
    if (field && field.length) Array.from(field).forEach((f) => (f.required = true));
  });

  ["firstName", "lastName", "dob", "username", "regNumber", "email", "password"].forEach((fieldName) => {
    if (!fields[fieldName]) return;

    fields[fieldName].addEventListener("blur", validateField);
    fields[fieldName].addEventListener("focus", clearErrorOnFocus);
    fields[fieldName].addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        navigateToNextField(fields[fieldName]);
      }
    });

    if (fieldName === "firstName" || fieldName === "lastName") {
      fields[fieldName].addEventListener("input", function () {
        this.value = this.value.replace(/\b\w/g, (l) => l.toUpperCase());
      });
    }

    if (fieldName === "username" || fieldName === "regNumber") {
      fields[fieldName].addEventListener("input", function () {
        this.value = this.value.toUpperCase();
      });
    }
  });

  if (fields.password) {
    fields.password.addEventListener("input", function () {
      if (!passwordIsValid) updatePasswordStrength();
    });
  }

  if (fields.gender && fields.gender.length) {
    Array.from(fields.gender).forEach((radio) => {
      radio.addEventListener("change", function () {
        const genderGroup = document.getElementById("gender-group") || radio.closest(".gender-group");
        if (genderGroup) {
          clearError(genderGroup);
          const label = genderGroup.getElementsByClassName("radio-group-label")[0];
          if (label) label.style.color = "var(--md-primary)";
        }
      });

      radio.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          navigateToNextField(radio);
        }
      });
    });
  }

  if (fields.terms) {
    fields.terms.addEventListener("change", function () {
      if (this.checked) clearError(this.closest(".form-field"));
    });

    fields.terms.addEventListener("keydown", (e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        fields.terms.checked = !fields.terms.checked;
        fields.terms.dispatchEvent(new Event("change"));
        if (e.key === "Enter") navigateToNextField(fields.terms);
      }
    });
  }

  if (passwordToggle) {
    passwordToggle.addEventListener("click", function () {
      if (!fields.password) return;
      fields.password.type = fields.password.type === "password" ? "text" : "password";
      const icon = this.getElementsByClassName("visibility-icon")[0];
      if (icon) icon.textContent = fields.password.type === "password" ? "visibility" : "visibility_off";
    });
  }

  // Form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formData = {
        firstName: fields.firstName.value,
        lastName: fields.lastName.value,
        dob: fields.dob.value,
        gender: Array.from(fields.gender).find((r) => r.checked)?.value || null,
        username: fields.username.value,
        regNumber: fields.regNumber.value,
        email: fields.email.value,
        password: fields.password.value,
        termsAccepted: fields.terms.checked,
      };
      console.log(JSON.stringify(formData, null, 2));
      alert("Form submitted successfully!");
    }
  });

  function navigateToNextField(currentField) {
    const formElements = form.elements;
    for (let i = 0; i < formElements.length; i++) {
      if (formElements[i] === currentField && i < formElements.length - 1) {
        formElements[i + 1].focus();
        break;
      }
    }
  }

  function clearErrorOnFocus() {
    this.classList.add("touched");
    clearError(this.closest(".form-field"));
    this.classList.remove("error");
  }

  function clearError(container) {
    if (!container) return;
    const errorElement = container.getElementsByClassName("error-message")[0];
    if (errorElement) {
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
    }
  }

  function showError(element, message) {
    const container = element.closest(".form-field");
    const errorElement = container?.getElementsByClassName("error-message")[0];
    if (!errorElement) return false;

    if (message) {
      errorElement.textContent = message;
      errorElement.classList.add("visible");
      element.classList.add("error");
      return true;
    } else {
      errorElement.textContent = "";
      errorElement.classList.remove("visible");
      element.classList.remove("error");
      element.classList.add("valid");

      const label = container.getElementsByTagName("label")[0];
      if (label) label.style.color = "var(--md-primary)";
      return false;
    }
  }

  function validateField() {
    const field = this;
    let errorMessage = null;

    switch (field.id) {
      case "first-name":
      case "last-name":
        errorMessage = !field.value.trim() ? "Required" : !/^[A-Za-z\s]+$/.test(field.value) ? "Only letters and spaces allowed" : null;
        break;
      case "dob":
        errorMessage = !field.value ? "Required" : validateDate(field.value);
        break;
      case "username":
        errorMessage = !field.value.trim() ? "Required" : !/^[a-zA-Z0-9]{10,15}$/.test(field.value) ? "Invalid VTOP Username!" : null;
        break;
      case "reg-number":
        errorMessage = !field.value.trim() ? "Required" : !/^\d{2}[a-zA-Z]{3}\d{4}$/.test(field.value) ? "Please check your format." : null;
        break;
      case "email":
        errorMessage = !field.value.trim() ? "Required" : !/^[a-zA-Z0-9._-]+@vitstudent\.ac\.in$/.test(field.value) ? "Only VIT email ID is allowed!" : null;
        break;
      case "password":
        errorMessage = !field.value ? "Required" : validatePassword(field.value);
        break;
      case "terms":
        errorMessage = field.checked ? null : "You must accept the terms and conditions";
        break;
    }

    return !showError(field, errorMessage);
  }

  function validateDate(date) {
    const [year, month, day] = date.split("-").map(Number);
    const today = new Date();
    const currentYear = today.getFullYear();

    if (year < currentYear - 100 || year > currentYear - 15) return "Age must be between 15 and 100 years";

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
      daysInMonth[1] = 29;
    }

    return day <= daysInMonth[month - 1] ? null : `Invalid day for ${new Date(year, month - 1).toLocaleString("default", {month: "long"})}`;
  }

  function validatePassword(password) {
    const requirements = [
      {regex: /[A-Z]/, message: "At least one uppercase letter"},
      {regex: /[a-z]/, message: "At least one lowercase letter"},
      {regex: /\d/, message: "At least one number"},
      {regex: /[!@#$%^&*]/, message: "At least one special character"},
      {regex: /.{8,}/, message: "At least 8 characters long"},
    ];

    const unmet = requirements.filter((req) => !req.regex.test(password)).map((req) => req.message);
    return unmet.length ? unmet.join(", ") : null;
  }

  function updatePasswordStrength() {
    const password = fields.password.value;
    const strengthLevel = document.getElementById("strength-level");
    const requirements = document.getElementsByClassName("requirement");

    if (!password) {
      if (strengthLevel) {
        strengthLevel.textContent = "None";
        strengthLevel.className = "";
      }
      Array.from(requirements).forEach((req) => req.classList.remove("valid"));
      return;
    }

    const reqChecks = [
      {id: "req-uppercase", regex: /[A-Z]/},
      {id: "req-lowercase", regex: /[a-z]/},
      {id: "req-number", regex: /\d/},
      {id: "req-special", regex: /[!@#$%^&*]/},
      {id: "req-length", regex: /.{8,}/},
    ];

    let metCount = 0;
    reqChecks.forEach((req) => {
      const el = document.getElementById(req.id);
      if (el) {
        const isValid = req.regex.test(password);
        el.classList.toggle("valid", isValid);
        if (isValid) metCount++;
      }
    });

    if (strengthLevel) {
      strengthLevel.classList.remove("strength-level-weak", "strength-level-medium", "strength-level-strong");

      if (metCount < 3) {
        strengthLevel.textContent = "Weak";
        strengthLevel.classList.add("strength-level-weak");
      } else if (metCount < 5) {
        strengthLevel.textContent = "Medium";
        strengthLevel.classList.add("strength-level-medium");
      } else {
        strengthLevel.textContent = "Strong";
        strengthLevel.classList.add("strength-level-strong");
      }
    }
  }

  function validateForm() {
    document.querySelectorAll(".error-message.visible").forEach((el) => el.classList.remove("visible"));

    let isValid = true;
    let firstErrorField = null;

    const fieldsToCheck = [fields.firstName, fields.lastName, fields.dob, fields.username, fields.regNumber, fields.email, fields.password];

    for (const field of fieldsToCheck) {
      if (!field) continue;
      field.classList.add("touched");
      if (!validateField.call(field)) {
        firstErrorField = field;
        isValid = false;
        break;
      }
    }

    if (isValid) {
      const genderSelected = Array.from(fields.gender).some((radio) => radio.checked);
      if (!genderSelected) {
        const genderGroup = document.getElementById("gender-group") || document.getElementsByClassName("gender-group")[0];
        if (genderGroup) {
          const errorElement = genderGroup.getElementsByClassName("error-message")[0];
          if (errorElement) {
            errorElement.textContent = "Please select your gender";
            errorElement.classList.add("visible");
          }
          firstErrorField = fields.gender[0];
          isValid = false;
        }
      }
    }

    if (isValid && fields.terms && !fields.terms.checked) {
      const termsContainer = fields.terms.closest(".form-field");
      const errorElement = termsContainer?.getElementsByClassName("error-message")[0];
      if (errorElement) {
        errorElement.textContent = "You must accept the terms and conditions";
        errorElement.classList.add("visible");
      }
      firstErrorField = fields.terms;
      isValid = false;
    }

    if (firstErrorField) firstErrorField.focus();

    return isValid;
  }
});
