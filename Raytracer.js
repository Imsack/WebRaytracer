let zBuffer = [];
let colorBuffer = [];
let hitBuffer = [];

let floorTexture;

function preload()
{
	floorTexture = loadImage("floorTexture.png");
}

const heightToWidthRatio = 0.5625;

canvasWidth = window.innerWidth / 10;
canvasHeight = canvasWidth * heightToWidthRatio;

function windowResized()
{
    if(window.innerWidth <= width) 
	{
		let newWidth = window.innerWidth * 0.9;
		resizeCanvas(Math.floor(newWidth), Math.floor(newWidth * heightToWidthRatio));
	}
}

function inputWidth()
{
	const inputWidth = document.querySelector("#inputWidth");
	canvasWidth = inputWidth.value;

	if(canvasWidth < window.innerWidth / 10) canvasWidth = window.innerWidth / 10;

	else if(canvasWidth > window.innerWidth / 1.3) canvasWidth = window.innerWidth / 1.3;

	canvasHeight = canvasWidth * heightToWidthRatio;

	resizeCanvas(Math.floor(canvasWidth), Math.floor(canvasHeight));
}

const tau = 6.283185307179586;

let Vector3D = function(x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
}

Vector3D.prototype.addConstant = function(c)
{
	this.x += c;
	this.y += c;
	this.z += c;
}

Vector3D.prototype.subtractConstant = function(c)
{
	this.x -= c;
	this.y -= c;
	this.z -= c;
}

Vector3D.prototype.addVector3D = function(vector)
{
	this.x += vector.x;
	this.y += vector.y;
	this.z += vector.z;
}

Vector3D.prototype.subtractVector3D = function(vector)
{
	this.x -= vector.x;
	this.y -= vector.y;
	this.z -= vector.z;
}

Vector3D.prototype.scaleIt = function(c)
{
	this.x *= c;
	this.y *= c;
	this.z *= c;
}

Vector3D.prototype.scaled = function(c)
{
	return new Vector3D(this.x * c, this.y * c, this.z * c);
}

Vector3D.prototype.magnitude = function()
{
	return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}

Vector3D.prototype.squaredMagnitude = function()
{
	return this.x * this.x + this.y * this.y + this.z * this.z;
}

function distance(v1, v2)
{
	return Math.sqrt((v2.x - v1.x) * (v2.x - v1.x) + 
	(v2.y - v1.y) * (v2.y - v1.y) + (v2.z - v1.z) * (v2.z - v1.z));
}

function squaredDistance(v1, v2)
{
	return (v2.x - v1.x) * (v2.x - v1.x) + 
	(v2.y - v1.y) * (v2.y - v1.y) + (v2.z - v1.z) * (v2.z - v1.z);
}

Vector3D.prototype.normalizeIt = function()
{
    //normalizes the vector
    let magnitude = this.magnitude();

    this.x /= magnitude;
    this.y /= magnitude;
    this.z /= magnitude;
}

Vector3D.prototype.normalized = function()
{
	//gives back a normalized version of the vector
	const magnitude = this.magnitude();
	return new Vector3D(this.x / magnitude, this.y / magnitude, this.z / magnitude);
}

let Sphere = function(radius, position, color, reflectivity, diffusivity, luminous)
{
	//position and color will be of type Vector3D
    this.radius = radius;
    this.position = position;
	this.color = color;
    this.reflectivity = reflectivity;
	this.diffusivity = diffusivity;
	this.luminous = luminous;
}

const spheres = [
	new Sphere(1, new Vector3D(0.5, 0.3, 7), new Vector3D(255, 0, 0), 0, 0, true),
	new Sphere(1, new Vector3D(4, 0.5, 12), new Vector3D(0, 255, 0), 1.2, 0.3, false),
	new Sphere(1, new Vector3D(-3, 0.75, 10), new Vector3D(0, 0, 255), 0, 0, true),
	new Sphere(1.5, new Vector3D(-6, 1.5, 9), new Vector3D(255, 0, 255), 1.5, 0.7, false),
	new Sphere(2, new Vector3D(6, 1.5, 9.5), new Vector3D(0, 255, 255), 2, 0.4, false),
	new Sphere(3, new Vector3D(-1, 2, 15), new Vector3D(255, 255, 0), 2, 0.3, false)
]

const lightSources = [
	spheres[0],
	spheres[2]
]

const floorLevel = -1;
const skyColor = new Vector3D(9, 18, 25);

function vectorAdd3D(vector1, vector2)
{
	return new Vector3D(vector1.x + vector2.x, vector1.y + vector2.y, vector1.z + vector2.z);
}

function vectorSubtract3D(vector1, vector2)
{
	return new Vector3D(vector1.x - vector2.x, vector1.y - vector2.y, vector1.z - vector2.z);
}

function vectorDotproduct3D(vector1, vector2)
{
	return vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
}

function sphereIntersect(startPos, endPos, sphere, color, bufferX, bounceCount)
{
	const dxdz = (endPos.x - startPos.x) / (endPos.z - startPos.z);
	const dydz = (endPos.y - startPos.y) / (endPos.z - startPos.z);

	//We will abbreviate som terms here for the sake of shortening the mess that is about to happen
	//sx = startPos.x
	//sy = startPos.y
	//sz = startPos.z
	//i = sphere.position.x
	//j = sphere.position.y
	//k = sphere.position.z
	//r = sphere.radius

	//for some value z, this equation must have a real answer if the ray is
	//intersecting the sphere at the point (z * dxdz + sx, z * dydz + sy, z + sz)

	//((z * dxdz) + sx - i)^2 + ((z * dydz) + sy - j)^2 + (z + sz - k)^2 = r^2

	//here z is the unknown we want to solve for

	//expanding this equation we get:

  	//(z * dxdz)^2 + 2(z * dxdz)(sx - i) + (sx - i)^2 +
	//(z * dydz)^2 + 2(z * dydz)(sy - j) + (sy - j)^2 +
	//z^2 + 2z(sz - k) + (sz - k)^2 = r^2

	//we want this to be in this format:
	//az^2 + bz + c = 0

	//z^2 * dxdz * dxdz + z * 2 * dxdz * (sx - i) + (sx - i) * (sx - i) +
	//z^2 * dydz * dydz + z * 2 * dydz * (sy - j) + (sy - j) * (sy - j) +
	//z^2 + z * 2 * (sz - k) + (sz - k) * (sz - k) = r * r

	//we then get that:

	//a = dxdz * dxdz + dydz * dydz + 1
	//b = 2 * dxdz * (sx - i) + 2 * dydz * (sy - j) + 2 * (sz - k)
	//c = (sx - i) * (sx - i) + (sy - j) * (sy - j) + (sz - k) * (sz - k) - r * r

	const a = dxdz * dxdz + dydz * dydz + 1;

	const b = 2 * dxdz * (startPos.x - sphere.position.x) +
	2 * dydz * (startPos.y - sphere.position.y) +
	2 * (startPos.z - sphere.position.z);

	const c = (startPos.x - sphere.position.x) * (startPos.x - sphere.position.x) +
	(startPos.y - sphere.position.y) * (startPos.y - sphere.position.y) +
	(startPos.z - sphere.position.z) * (startPos.z - sphere.position.z) - sphere.radius * sphere.radius;

	const insideOfRoot = b * b - 4 * a * c;

	//if this number is negative, then taking the root of it will give
	//an imaginary number which means that there is no intersection, so we exit the function
	if(insideOfRoot < 0) return color;

	const root = sqrt(insideOfRoot);

	//we can now solve for the roots of the equation using the quadratic formula

	const z1 = (-b + root) / (2 * a);
	const z2 = (-b - root) / (2 * a);

	const vec1 = new Vector3D(z1 * dxdz, z1 * dydz, z1);
	const vec2 = new Vector3D(z2 * dxdz, z2 * dydz, z2);

	vec1.scaleIt(0.99999);
	vec2.scaleIt(0.99999);

	//if the intersection occured in the opposite direction of the ray then we exit the function
	//this can happen since we were treating the ray
	//as an infinitely long line going in both directions in the intersection calculation
	if(vectorDotproduct3D(vec1, vectorSubtract3D(endPos, startPos)) <= 0)
	{
		return color;
	}

	let intersection = new Vector3D(0, 0, 0);

	let sizeOfVec1 = vec1.squaredMagnitude();
	let sizeOfVec2 = vec2.squaredMagnitude();

	//if the depth at the intersection with the object is greater than what is in
	//the zBuffer at that given pixel we exit the function to not draw over any closer objects
	if(sizeOfVec1 > zBuffer[bufferX] && sizeOfVec2 > zBuffer[bufferX])
	{
		return color;
	}

	//we check which of the two vectors is the shortest to know which one we should use
	//to calculate the closest intersection with the sphere
	if(sizeOfVec1 < sizeOfVec2)
	{
		zBuffer[bufferX] = sizeOfVec1;
		intersection = vectorAdd3D(vec1, startPos);
	}
	else
	{
		zBuffer[bufferX] = sizeOfVec2;
		intersection = vectorAdd3D(vec2, startPos);
	}

	const normal = sphereNormal(intersection, sphere);
	const directionVector = vectorSubtract3D(startPos, intersection);

	const newColor = reflections(intersection, directionVector, 
		normal, sphere.reflectivity, sphere.diffusivity, bufferX, bounceCount);

	let unshadedColor = vectorAdd3D(sphere.color, newColor.scaled(sphere.reflectivity));
	unshadedColor.scaleIt(1 / (sphere.reflectivity + 1));

	colorBuffer[bufferX] = shade(intersection, unshadedColor, sphere.luminous);

	return colorBuffer[bufferX];
}

function floorIntersect(startPos, endPos, color, bufferX, bounceCount)
{
	const dxdz = (endPos.x - startPos.x) / (endPos.z - startPos.z);
	const dydz = (endPos.y - startPos.y) / (endPos.z - startPos.z);

	if(dydz == 0) return color;

	//if the floor is at y = yLevel then the following equation
	//must be true when the ray is intersecting the floor

	//z * dydz + startPos.y = yLevel

	//z * dydz = yLevel - startPos.y

	//z = (yLevel - startPos.y) / dydz

	const z = (floorLevel - startPos.y) / dydz;

	let intersection = new Vector3D(z * dxdz, z * dydz, z);

	const sizeOfIntersection = intersection.squaredMagnitude();

	if(sizeOfIntersection > zBuffer[bufferX]) return color;

	if(vectorDotproduct3D(intersection, vectorSubtract3D(endPos, startPos)) <= 0) return color;

	intersection = vectorAdd3D(intersection, startPos);

	intersection.y += 0.0001;

	const offset = 100000000;
	const planeScale = 100;

	const textureX = Math.floor(intersection.x * planeScale) + offset;
	const textureY = Math.floor(intersection.z * planeScale) + offset;

	const texColor = floorTexture.get(textureX % floorTexture.width, textureY % floorTexture.height);
	const planeColor = new Vector3D(red(texColor), green(texColor), blue(texColor));

	const directionVector = vectorSubtract3D(startPos, intersection);

	const reflectivity = 0.5;

	const newColor = reflections(intersection, directionVector, 
		new Vector3D(0, 1, 0), reflectivity, 0.2, bufferX, bounceCount);

	let unshadedColor = vectorAdd3D(planeColor, newColor.scaled(reflectivity));
	unshadedColor.scaleIt(1 / (reflectivity + 1));

	colorBuffer[bufferX] = shade(intersection, unshadedColor, false);

	return colorBuffer[bufferX];
}

function shade(point, color, luminous)
{
	if(luminous)
	{
		return color;
	}

	let newColor = new Vector3D(0, 0, 0);

	let totalBrightness = 0;

	for(let i = 0; i < lightSources.length; i++)
	{
		let hitCount = 1;

		const shadowIntensity = (1 / (lightSources[i].radius * 20));

		//how many rays we will send out to approximate smooth shadows
		let numberOfRays = 70;

		for(let j = 0; j < numberOfRays; j++)
		{
			let hit = 0;

			let randomOffset = new Vector3D(Math.random(), Math.random(), Math.random());
			randomOffset.subtractConstant(0.5);

			randomOffset.normalizeIt();
			randomOffset.scaleIt(lightSources[i].radius);

			//each ray will be sent of in the general direction of the lightsource but with a random offset
			const endPos = new Vector3D
			(lightSources[i].position.x + randomOffset.x, 
			lightSources[i].position.y + randomOffset.y, 
			lightSources[i].position.z + randomOffset.z);

			for(let k = 0; k < spheres.length; k++)
			{
				if(intersectsWithSphere(point, endPos, spheres[k], lightSources[i])) hit = shadowIntensity;
			}

			if(intersectsWithFloor(point, endPos, lightSources[i])) hit = shadowIntensity;

			hitCount += hit;
		}

		const distanceBetween = distance(point, lightSources[i].position) - lightSources[i].radius;
		const brightness = 1 / (hitCount * distanceBetween + 1);
		totalBrightness += brightness;

		const tempColor = vectorAdd3D(color, lightSources[i].color).scaled(brightness);

		newColor.addVector3D(tempColor);
	}

	return newColor.scaled(1 / (totalBrightness + 1));
}

function intersectsWithSphere(startPos, endPos, sphere, lightSource)
{
	//this is mostly the same code as in the sphereIntersect function
	//although it gives back a boolean for whether or not the ray intersects the sphere
	//instead of the point of intersection
	const dxdz = (endPos.x - startPos.x) / (endPos.z - startPos.z);
	const dydz = (endPos.y - startPos.y) / (endPos.z - startPos.z);

	const a = dxdz * dxdz + dydz * dydz + 1;

	const b = 2 * dxdz * (startPos.x - sphere.position.x) +
	2 * dydz * (startPos.y - sphere.position.y) +
	2 * (startPos.z - sphere.position.z);

	const c = (startPos.x - sphere.position.x) * (startPos.x - sphere.position.x) +
	(startPos.y - sphere.position.y) * (startPos.y - sphere.position.y) +
	(startPos.z - sphere.position.z) * (startPos.z - sphere.position.z) - sphere.radius * sphere.radius;

	const insideOfRoot = b * b - 4 * a * c;

	if(insideOfRoot < 0) return false;

	const root = sqrt(insideOfRoot)

	const z1 = (-b + root) / (2 * a);

	const vector = new Vector3D(z1 * dxdz, z1 * dydz, z1);

	if(vectorDotproduct3D(vector, vectorSubtract3D(endPos, startPos)) < 0) return false;

	if(vector.magnitude() > distance(lightSource.position, startPos) - lightSource.radius) return false;

	return true;
}

function intersectsWithFloor(startPos, endPos, lightSource)
{
	const dxdz = (endPos.x - startPos.x) / (endPos.z - startPos.z);
	const dydz = (endPos.y - startPos.y) / (endPos.z - startPos.z);

	if(dydz == 0) return false;

	const z = (floorLevel - startPos.y) / dydz;

	const vector = new Vector3D(z * dxdz, z * dydz, z);

	if(vectorDotproduct3D(vector, vectorSubtract3D(endPos, startPos)) < 0) return false;

	if(vector.magnitude() > distance(lightSource.position, startPos) - lightSource.radius) return false;

	return true;
}

function sphereNormal(point, sphere)
{
	const normal = vectorSubtract3D(point, sphere.position).normalized();

	return normal;
}

function reflections(point, directionVector, normal, reflectivity, diffusivity, bufferX, bounceCount)
{
	if(reflectivity == 0) return new Vector3D(0, 0, 0);

	let newColor = skyColor;

	if(bounceCount < 2)
	{
		bounceCount += 1;

		const reflectedVector = reflect(point, directionVector, normal);

		let addedColor = new Vector3D(0, 0, 0);

		const numberOfRays = 1 + (9 * diffusivity);

		const depth = zBuffer[bufferX];

		for(let i = 0; i < numberOfRays; i++)
		{
			numberOfBounces += 1;

			let randomOffset = new Vector3D(Math.random(), Math.random(), Math.random());
			randomOffset.subtractConstant(0.5);
			randomOffset.normalizeIt();
			randomOffset.scaleIt(diffusivity);

			const endPos = vectorAdd3D(reflectedVector, randomOffset);

			let tempColor = newColor;

			for(let j = 0; j < spheres.length; j++)
			{
				tempColor = sphereIntersect(point, endPos, spheres[j], tempColor, bufferX, bounceCount);
			}
			
			tempColor = floorIntersect(point, endPos, tempColor, bufferX, bounceCount);

			addedColor.addVector3D(tempColor);

			zBuffer[bufferX] = depth;
		}

		newColor = addedColor.scaled(1 / numberOfRays);
	}

	return newColor;
}

function reflect(point, vector, normal)
{
	const scalar = vectorDotproduct3D(vector, normal) * 2;

	normal.scaleIt(scalar);

	const directionVector = vectorSubtract3D(normal, vector);

	return vectorAdd3D(directionVector, point)
}

function setup()
{
	const canvas = createCanvas(Math.floor(canvasWidth), Math.floor(canvasHeight));
	canvas.parent("sketchHolder");
	background(0);
	noStroke();
	noLoop();
}

function draw()
{
	for(let i = 0; i < width * height; i++)
	{
		zBuffer[i] = Infinity;
		colorBuffer[i] = skyColor;
	}

	const forward = (height / 2) / Math.tan(tau / 16);

	for(let y = -height / 2; y < height / 2; y++)
	{
		for(let x = -width / 2; x < width / 2; x++)
		{
			finishedBouncing = false;
			numberOfBounces = 0;

			const startVector = new Vector3D(0, 0, 0);
			const forwardVector = new Vector3D(x, y, forward);

			const screenX = x + width / 2;
			const screenY = y + height / 2;

			const bufferX = width * screenY + screenX;
			
			for(let i = 0; i < spheres.length; i++)
			{
				sphereIntersect(startVector, forwardVector, spheres[i], spheres[i].color, bufferX, 0);
			}
			
			floorIntersect(startVector, forwardVector, new Vector3D(0, 0, 0), bufferX, 0);

			const color = colorBuffer[bufferX];
			
			fill(color.x, color.y, color.z);
			rect(screenX, height - screenY - 1, 1, 1);
		}
	}
}
