window.addEventListener('DOMContentLoaded', function() {
    let temaCurenta = localStorage.getItem('tema');

    function schimbareTema() {
        if (temaCurenta === 'light') {
            document.body.className = '';
            document.getElementById('toggle-tema').classList='fas fa-sun';
            document.getElementById('snow').style.display = 'none';
        } else if (temaCurenta === 'dark') {
            document.body.className = 'dark';
            document.getElementById('toggle-tema').classList='fas fa-moon';
            document.getElementById('snow').style.display = 'none';
        } else {
            document.body.className = 'craciun';
            document.getElementById('toggle-tema').classList='fas fa-snowflake';
            document.getElementById('snow').style.display = 'block';
        }
    }

    schimbareTema();

    // toggle tema (light->dark->craciun)
    document.getElementById('toggle-tema').addEventListener('click', function() {
        let toggle = document.getElementById('toggle-tema');
        if (temaCurenta === 'light') {
            localStorage.setItem('tema', 'dark');
            temaCurenta = 'dark';
        } else if (temaCurenta === 'dark') {
            localStorage.setItem('tema', 'craciun');
            temaCurenta = 'craciun';
        } else {
            localStorage.setItem('tema', 'light');
            temaCurenta = 'light';
        }
        schimbareTema();
    });
    
});