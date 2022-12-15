//Doi tuong Validator
function Validator(options) {
  // getParent Element for formGroup
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
  var a = getParent(document.querySelector("#email"), ".form-group");
  console.log(a);
  //selectorRules {"#email": [funciton isRequired, isEmail...]}
  var selectorRules = {};

  function validate(inputElement, rule) {
    // rule: {selector: selector, test: .... }
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
      options.errorSelector
    );
    var errorMessage;
    // Lấy ra các rule của selector
    var rules = selectorRules[rule.selector]; //[function isRequired, function: isEmail]
    //lặp qua các rule của một selector và kiểm tra
    //Nếu có lỗi thì dừng kiểm tra
    for (var i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "radio":
        case "checkbox":
          errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"));
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
    }
    return !errorMessage;
  }

  var formElement = document.querySelector(options.form);
  if (formElement) {
    //Lắng nghe sự kiện submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();
      var isFormValid = true;

      //lặp qua từng rule và validate
      options.rules.forEach((rule) => {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        //Submit với Javascript
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValues = Array.from(enableInputs).reduce((values, input) => {
            switch (input.type) {
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;
                break;

              case "checkbox":
                if (!input.matches(":checked")) {
                  values[input.name] = "";
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;

              case "file":
                values[input.name] = input.files;
                break;

              default:
                values[input.name] = input.value;
            }
            return values;
          }, {});
          options.onSubmit(formValues);
          console.log(formValues);
        }
        //Submit voi hành vi mặc định
        else {
          formElement.submit();
        }
      }
    };
    // Lặp qua mỗi rule và xủ lý lắng nghe sự kiện blur, input....
    options.rules.forEach(function (rule) {
      //Lưu lại các rules cho mỗi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test]; // => selectorRules {"#email": [funciton isRequired, isEmail...]}
      }

      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach((inputElement) => {
        //Xu ly onblur
        inputElement.onblur = function () {
          validate(inputElement, rule);
        };
        // Xu ly moi khi nguoi dung nhap vao input
        inputElement.oninput = function () {
          var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
            options.errorSelector
          );
          errorElement.innerText = "";
          getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
        };
      });
    });
  }
}

//Ham validator cung la mot object nen ta dinh nghia ben ngoai obj
// Dinh nghia cac rules
//Nguyen tac cua cac rules
//1.Khi co loi => Tra message loi
//2. Khi hop le => khong tra gi (undefined)
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var regex =
        /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
      return regex.test(value) ? undefined : message || "Vui lòng nhập email";
    },
  };
};

Validator.minLength = function (selector, min) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
