//Đối tượng Validator
function Validator(options) {

    var selectorRules = {};


    //Hàm thực hiện Validate
    function validate(inputElement, rule) {

        var errorElement = inputElement.parentElement.querySelector('.form-message');
        var errorMessage;

        //Lấy ra các rules của selector
        var rules = selectorRules[rule.selector];

        //Lặp qua từng rule và kiểm tra
        //Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }



        inputElement.parentElement.classList.add('invalid');
        if (errorMessage) {
            errorElement.innerText = errorMessage;
        } else {
            errorElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid')
        }

        return !errorMessage;
    }

    //Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        //khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault(); //Chặn giá trị mặc định

            var isFormValid = true;

            //lặp qua từng rule và validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }

            });

            if (isFormValid) {
                //trường hợp submit với JavaScript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])') //(lấy ra các thẻ có attribute là name và k có disabled)
                        // enableInputs trả về nodeList sẽ không có các phương thức của array. VD: reduce, map....
                        //nên converse từ nodeList về array dùng Array.from(enableInputs)
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value
                        return values;
                    }, {});
                    options.onSubmit(formValues);

                }
                //trường hợp submit với hành vi mặc định cuar html
                else {
                    formElement.submit();
                }
            }
        }

        //Lặp qua mỗi rule và xử lý (lắng nghe sự kiện blur, input,...)
        options.rules.forEach(rule => {
            //Lưu lại các rules cho mỗi input 
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                //Xử lý trường hợp khi blur khỏi input
                inputElement.onblur = function() {
                        validate(inputElement, rule)
                    }
                    //Xử lý trường hợp khi người dùng nhập vào input
                inputElement.oninput = function() {
                    var errorElement = inputElement.parentElement.querySelector('.form-message');
                    errorElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid')
                }
            }
        });
    }
}
//Định nghĩa rules
//Nguyên tắc của các rule
//1.Khi có lỗi => trả ra message lỗi
//2.Khi hợp lệ => không trả về gì cả (undefined)
Validator.isRequired = function(selector, message) {
        return {
            selector,
            test: function(value) {
                return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
            }
        };

    }
    // key word kiểm tra email : javascript email regex
Validator.isEmail = function(selector, message) {
        return {
            selector,
            test: function(value) {
                var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                return regex.test(value) ? undefined : message || 'Đây không phải là email. Vui lòng nhập email';

            }
        };
    }
    //
Validator.minLength = function(selector, min, message) {
    return {
        selector,
        test: function(value) {

            return value.length >= min ? undefined : message || `Nhập tối thiểu ${min} ký tự`;

        }
    };
}
Validator.isConfirmed = function(selector, getConfirmValue, message) {
    return {
        selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác';
        }
    }
}