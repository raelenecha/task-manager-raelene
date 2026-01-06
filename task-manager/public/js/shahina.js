function addUser() {
    var response = '';

    var jsonData = new Object();
    jsonData.name = document.getElementById("name").value;
    jsonData.email = document.getElementById("email").value;
    jsonData.password = document.getElementById("password").value;
    jsonData.confirmPassword = document.getElementById("confirmPassword").value;

    var request = new XMLHttpRequest();
    request.open('POST', '/add-user', true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function () {
        response = JSON.parse(request.responseText);
        console.log(response);

        if (response.message === 'User created successfully') {
            localStorage.setItem("email", jsonData.email);
            alert('Welcome ' + jsonData.name + '!');
            window.location.href = "../index.html";
        } else {
            // show backend error message
            alert(response.message);
        }
    };
    request.send(JSON.stringify(jsonData));
}

