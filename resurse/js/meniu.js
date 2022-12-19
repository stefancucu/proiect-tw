window.addEventListener('DOMContentLoaded', ()=>{
    function getCurrentPage() {
        return window.location.pathname;
    }
    console.log(getCurrentPage());
    if(getCurrentPage() == '/home' || getCurrentPage() == '/' || getCurrentPage() == '/index') {
        document.getElementById('pag-acasa').style.color = 'var(--secondary)';
    }
    else if (getCurrentPage() == '/produse'){
        document.getElementById('pag-produse').style.color = 'var(--secondary)';
    }
    else if (getCurrentPage() == '/galerie') {
        document.getElementById('pag-galerie').style.color = 'var(--secondary)';
    }
    else if (getCurrentPage() == '/about') {
        document.getElementById('pag-about').style.color = 'var(--secondary)';
    }
})