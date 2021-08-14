let dx,dy,posvalues,distvalues,snap,aimTimeline,currentTimeline,renderer;
let  globe,tennis,basketball,beachball,football,softball,cloud,scene,camera;

function loading(){
  setTimeout(function(){
    const loadingScreen = document.getElementById( 'loading-screen' );
    const find_yr = document.getElementById( 'find_yr' );	
    loadingScreen.classList.add( 'fade-out' );
    find_yr.classList.add( 'fade-in' );
    var typed = new Typed('.typed', {
      strings: ["Teammate^500", "Opponent^500","Partner^500","Rival^500","Workout Buddy^500","Running Partner^500","Sport^500"],
      typeSpeed: 50,
      backSpeed: 50
    });
    loadingScreen.addEventListener( 'transitionend', onTransitionEnd );
  })
}

function init() {   

// Scene
 scene = new THREE.Scene()

// Globe
const ggeometry = new THREE.SphereGeometry(1,64,64);
const gtexture = new THREE.TextureLoader().load( './images/map.jpg',loading);
const gbumpMap = new THREE.TextureLoader().load('./images/bumpMap.jpg')
const gmaterial = new THREE.MeshPhongMaterial({map:gtexture,bumpMap:gbumpMap});
gmaterial.specularMap = new THREE.TextureLoader().load('./images/specMap.jpg')
gmaterial.bumpScale = 0.05
 globe = new THREE.Mesh(ggeometry,gmaterial)
scene.add(globe)

//Tennis
const tgeometry = new THREE.SphereGeometry(1.01,64,64);
const ttexture = new THREE.TextureLoader().load( './images/tennisball.jpg' );
const tbumpMap = new THREE.TextureLoader().load('./images/tennisball_bump.jpg')
const tmaterial = new THREE.MeshStandardMaterial({map:ttexture,bumpMap:tbumpMap,transparent:true});
tmaterial.bumpScale = 0.03
 tennis = new THREE.Mesh(tgeometry,tmaterial)
scene.add(tennis)

//BasketBall
const bgeometry = new THREE.SphereGeometry(1.02,64,64);
const btexture = new THREE.TextureLoader().load( './images/basketball.png' );
const bnormal = new THREE.TextureLoader().load( './images/basketball_normal.png' );
const bmaterial = new THREE.MeshPhongMaterial({map:btexture,transparent:true,normalMap:bnormal});
 basketball = new THREE.Mesh(bgeometry,bmaterial)
scene.add(basketball)

//BeachBall
const begeometry = new THREE.SphereGeometry(1.03,64,64);
const betexture = new THREE.TextureLoader().load( './images/beachball.jpg' );
const benormal = new THREE.TextureLoader().load('./images/beachball_normal.png')
const bematerial = new THREE.MeshPhongMaterial({map:betexture,transparent:true,normalMap:benormal});
 beachball = new THREE.Mesh(begeometry,bematerial)
scene.add(beachball)

//FootBall
const fgeometry = new THREE.SphereGeometry(1.04,64,64);
const ftexture = new THREE.TextureLoader().load( './images/football.jpg' );
const fnormal = new THREE.TextureLoader().load( './images/football_normal.png' );
const fmaterial = new THREE.MeshPhongMaterial({map:ftexture,transparent:true,normalMap:fnormal});
 football = new THREE.Mesh(fgeometry,fmaterial)
scene.add(football)

//SoftBall
const sgeometry = new THREE.SphereGeometry(1.05,64,64);
const stexture = new THREE.TextureLoader().load( './images/softball.jpg' );
const snormal = new THREE.TextureLoader().load( './images/softball_normal.png' );
const smaterial = new THREE.MeshPhongMaterial({map:stexture,transparent:true,normalMap:snormal});
smaterial.bumpScale= 0.03
 softball = new THREE.Mesh(sgeometry,smaterial)
scene.add(softball)



//Lighting
scene.add(new THREE.AmbientLight(0x333333));
var light = new THREE.DirectionalLight(0xffffd9, 1);
// light.position.set(40,40,80);
light.position.set(-69,40,80);
scene.add(light);

//Clouds
 cloud = new THREE.Mesh(
    new THREE.SphereGeometry(1.058,64,64),
    new THREE.MeshPhongMaterial({
      map: new THREE.TextureLoader().load('./images/clouds.png'),
      transparent: true
    })
  )
scene.add(cloud)

//Sizes 
const sizes = {
    width:(window.innerWidth),
    height:(window.innerHeight)
}

//Camera
camera = new THREE.PerspectiveCamera(45,sizes.width/sizes.height,0.1,1000)
camera.position.z = 3
camera.position.x = -2
camera.position.y = 0.1

scene.add(camera)


//Renderer
const canvas = document.querySelector('.webgl')
 renderer = new THREE.WebGLRenderer({alpha:true , antialias:true})
renderer.setSize(sizes.width,sizes.height)
canvas.appendChild(renderer.domElement)

//var controls = new THREE.TrackballControls(camera,renderer.domElement);

 currentTimeline = window.pageYOffset/6000
 aimTimeline = window.pageYOffset/6000

 posvalues = [0,0.2,0.4,0.6,0.8,1];
 distvalues = [0,0.2,0.4,0.6,0.8,1];
posvalues.forEach((e,k)=>
  {
    distvalues[k] = Math.abs(e-aimTimeline)
  })
 dy=0;let snap = 0;
 dx=0

 window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function onTransitionEnd( event ) {

	const element = event.target;
	element.remove();
	
}


function animate()
{
    //controls.update();
    requestAnimationFrame( animate )
    currentTimeline += (aimTimeline-currentTimeline)*0.06
    const ry =  currentTimeline * Math.PI * 4
    dx+=(Math.PI/5000*2)%(Math.PI*2)

    var min = 2;
    posvalues.forEach((element,k) => {
      if(distvalues[k]>=Math.abs(element-aimTimeline) && Math.abs(element-aimTimeline)<=Math.abs(min))
      {
        min = element-aimTimeline;
        snap = k;
      }
      distvalues[k] = Math.abs(element-aimTimeline)
    });
    dy=min
    window.scrollTo(0,window.pageYOffset+6000*dy*0.06)
    
    tennis.material.opacity = (currentTimeline)/0.2
    basketball.material.opacity = (currentTimeline-0.2)/0.2
    beachball.material.opacity = (currentTimeline-0.4)/0.2
    football.material.opacity = (currentTimeline-0.6)/0.2
    softball.material.opacity = (currentTimeline-0.8)/0.2

    globe.rotation.set(0.2,-ry-2.7+dx,0)

    tennis.rotation.set(-ry-0.9,-ry-2.7+dx,Math.PI/6)
    basketball.rotation.set(-ry+0.2,-ry-2.7+dx,Math.PI/6)
    beachball.rotation.set(-ry,-ry-2+dx,Math.PI/6)
    football.rotation.set(-ry-2.7,-ry-2.7+dx,Math.PI/6)
    softball.rotation.set(-ry-2.7,-ry-2+dx,Math.PI/6)

    cloud.rotation.set(0,-ry/4+1.69*dx,0)
    cloud.material.opacity=(0.2-currentTimeline)/0.2
    
    renderer.render(scene,camera)


    const b1 = document.getElementById( 'box1' );	
    const b2 = document.getElementById( 'box2' );	
    const b3 = document.getElementById( 'box3' );	
    const b4 = document.getElementById( 'box4' );	
    const b5 = document.getElementById( 'box5' );	
    const b6 = document.getElementById( 'box6' );	

    b1.style.opacity = (1-Math.abs(currentTimeline)/0.1);
    b2.style.opacity = (1-Math.abs(currentTimeline-0.2)/0.1);
    b3.style.opacity = (1-Math.abs(currentTimeline-0.4)/0.1);
    b4.style.opacity = (1-Math.abs(currentTimeline-0.6)/0.1);
    b5.style.opacity = (1-Math.abs(currentTimeline-0.8)/0.1);
    b6.style.opacity = (1-Math.abs(currentTimeline-1)/0.1);
    // console.log(pageYOffset/1000)
}
init();
animate()

window.addEventListener('scroll',function() {
  aimTimeline = window.pageYOffset/6000
})
