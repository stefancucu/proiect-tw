window.addEventListener('DOMContentLoaded', () => {
    function loadImages() {
        fetch('carousel').then((data)=>data.json()).then((produse)=>{
            if(produse == null || produse == undefined) {
                console.error('Nu am imagini!');
                return
            }
            if(produse.length < 5) {
                console.error('Nu am suficiente imagini');
                return;
            }
            document.getElementById('inner1').src = produse[0].img
            document.getElementById('inner1text').innerHTML = produse[0].nume

            document.getElementById('inner2').src = produse[1].img
            document.getElementById('inner2text').innerHTML = produse[1].nume

            document.getElementById('inner3').src = produse[2].img
            document.getElementById('inner3text').innerHTML = produse[2].nume

            document.getElementById('inner4').src = produse[3].img
            document.getElementById('inner4text').innerHTML = produse[3].nume

            document.getElementById('inner5').src = produse[4].img
            document.getElementById('inner5text').innerHTML = produse[4].nume
        })
        .catch((e)=>console.error(e))
    }
    
    loadImages();
    setInterval(()=>{
        loadImages();
    }, 15000)
})