let width = 500;
let height = 300;

let zBuffer = [];
let colorBuffer = [];
let hitBuffer = [];

let tau = 6.283185307179586;

let Vector3D = function(x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
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
	let magnitude = this.magnitude();
	return new Vector3D(this.x / magnitude, this.y / magnitude, this.z / magnitude);
}

let Sphere = function(radius, position, color, reflectivity)
{
	//position and color will be of type Vector3D
    this.radius = radius;
    this.position = position;
	this.color = color;
    this.reflectivity = reflectivity;
}

let spheres = [
	new Sphere(1, new Vector3D(0.5, 0, 7), new Vector3D(255, 0, 255), 1),
	new Sphere(1, new Vector3D(3, 0.5, 12), new Vector3D(255, 255, 0), 1),
	new Sphere(1, new Vector3D(-3, 0.75, 10), new Vector3D(0, 255, 255), 1)
]

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

function vectorCrossproduct(v1, v2)
{
	return new Vector3D(v1.y * v2.z + v1.z * v2.y, v1.z * v2.x + v1.x * v2.z, v1.x * v2.y + v1.y * v2.x);
}

function sphereIntersect(startPos, endPos, sphere, bufferX, reflectivity)
{
	let dxdz = (endPos.x - startPos.x) / (endPos.z - startPos.z);
	let dydz = (endPos.y - startPos.y) / (endPos.z - startPos.z);

	//We will abreviate som terms here for the sake of shortening the mess that is about to happen
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

	let a = dxdz * dxdz + dydz * dydz + 1;

	let b = 2 * dxdz * (startPos.x - sphere.position.x) +
	2 * dydz * (startPos.y - sphere.position.y) +
	2 * (startPos.z - sphere.position.z);

	let c = (startPos.x - sphere.position.x) * (startPos.x - sphere.position.x) +
	(startPos.y - sphere.position.y) * (startPos.y - sphere.position.y) +
	(startPos.z - sphere.position.z) * (startPos.z - sphere.position.z) - sphere.radius * sphere.radius;

	let insideOfRoot = b * b - 4 * a * c;

	//if this number is negative, then taking the root of it will give
	//an imaginary number which means that there is no intersection, so we exit the function
	if(insideOfRoot <= 0) return null;

	let root = sqrt(insideOfRoot)

	//we can now solve for the roots of the equation using the quadratic formula

	let z1 = (-b + root) / (2 * a);
	let z2 = (-b - root) / (2 * a);

	let vec1 = new Vector3D(z1 * dxdz, z1 * dydz, z1);
	let vec2 = new Vector3D(z2 * dxdz, z2 * dydz, z2);

	vec1.scaleIt(0.999);
	vec2.scaleIt(0.999);

	//if the intersection occured in the opposite direction of the ray then we exit the function
	//this can happen since we were treating the ray
	//as an infinitely long line going in both directions in the intersection calculation
	if(vectorDotproduct3D(vec1, vectorSubtract3D(endPos, startPos)) < 0)
	{
		return null;
	}

	let intersection = new Vector3D(0, 0, 0);

	let sizeOfVec1 = vec1.squaredMagnitude();
	let sizeOfVec2 = vec2.squaredMagnitude();

	//if the depth at the intersection with the object is greater than what is in
	//the zBuffer at that given pixel we exit the function to not draw over any closer objects
	if(sizeOfVec1 > zBuffer[bufferX] && sizeOfVec2 > zBuffer[bufferX])
	{
		return null;
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

	let color = colorBuffer[bufferX];
	
	colorBuffer[bufferX] = vectorAdd3D(color, sphere.color.scaled(reflectivity));
	hitBuffer[bufferX] += 1;

	shade(intersection, bufferX)
	//sphereTangent(intersection, sphere);
}

function floorIntersect(startPos, endPos, bufferX)
{
	let dxdz = (endPos.x - startPos.x) / (endPos.z - startPos.z);
	let dydz = (endPos.y - startPos.y) / (endPos.z - startPos.z);

	if(dydz == 0) return null;

	let yLevel = -1;

	//if the floor is at y = yLevel then the following equation
	//must be true when the ray is intersecting the floor

	//z * dydz + startPos.y = yLevel

	//z * dydz = yLevel - startPos.y

	//z = (yLevel - startPos.y) / dydz

	let z = (yLevel - startPos.y) / dydz;

	if(z*z > zBuffer[bufferX]) return null;

	let intersection = new Vector3D(z * dxdz, z * dydz, z);

	if(vectorDotproduct3D(intersection, vectorSubtract3D(endPos, startPos)) < 0)
	{
		return null;
	}

	intersection = vectorAdd3D(intersection, startPos);

	colorBuffer[bufferX] = new Vector3D(255, 255, 255);
	hitBuffer[bufferX] += 1;

	let directionVector = vectorSubtract3D(startPos, intersection);
	directionVector.normalizeIt();

	reflections(intersection, directionVector, new Vector3D(0, 1, 0), bufferX);
	shade(intersection, bufferX);
}

function shade(point, bufferX)
{
	let lightSource = new Sphere(100, new Vector3D(-110, -25, 5), new Vector3D(0, 0, 0), 1);

	let hitCount = 0.7;

	//how many rays we will send out to approximate smooth shadows
	let numberOfRays = 80;

	for(let i = 0; i < numberOfRays; i++)
	{
		let hit = 0;

		let randomOffset = new Vector3D(Math.random(), Math.random(), Math.random());

		randomOffset.scaleIt(lightSource.radius);

		//each ray will be sent of in the general direction of the lightsource but with a random offset
		let endPos = new Vector3D
		(lightSource.position.x + randomOffset.x, 
		lightSource.position.y + randomOffset.y, 
		lightSource.position.z + randomOffset.z);

		for(let j = 0; j < spheres.length; j++)
		{
			if(intersectsWithSphere(point, endPos, spheres[j]))
			{
				hit = 0.02;
			}
		}

		hitCount += hit;
	}

	let shade = 1 / (hitCount * hitCount);

	let color = colorBuffer[bufferX];

	colorBuffer[bufferX] = new Vector3D(color.x * shade, color.y * shade, color.z * shade);
}

function intersectsWithSphere(startPos, endPos, sphere)
{
	//this is the same code as in the sphereIntersect function
	//only it gives back a boolean for whether or not the ray intersects the sphere
	//instead of the point of intersection
	let dxdz = (endPos.x - startPos.x) / (endPos.z - startPos.z);
	let dydz = (endPos.y - startPos.y) / (endPos.z - startPos.z);

	let a = dxdz * dxdz + dydz * dydz + 1;

	let b = 2 * dxdz * (startPos.x - sphere.position.x) +
	2 * dydz * (startPos.y - sphere.position.y) +
	2 * (startPos.z - sphere.position.z);

	let c = (startPos.x - sphere.position.x) * (startPos.x - sphere.position.x) +
	(startPos.y - sphere.position.y) * (startPos.y - sphere.position.y) +
	(startPos.z - sphere.position.z) * (startPos.z - sphere.position.z) - sphere.radius * sphere.radius;

	let insideOfRoot = b * b - 4 * a * c;

	if(insideOfRoot < 0) return false;

	let root = sqrt(insideOfRoot)

	let z1 = (-b + root) / (2 * a);

	let vec1 = new Vector3D(z1 * dxdz, z1 * dydz, z1);

	if(vectorDotproduct3D(vec1, vectorSubtract3D(endPos, startPos)) < 0)
	{
		return false;
	}

	return true;
}

function sphereTangent(point, sphere)
{
	//this is the equation representing the sphere that we want to find the partial derivatives of
	//(x - i)^2 + (y - j)^2 + (z - k)^2 = r^2

	//expanding this equation we get:

	//x^2 - 2xi + i^2 + y^2 - 2yj + j^2 + z^2 - 2zk + k^2 = r^2

	//we want to find the partial derivate of z with respect to x
	//and the partial derivative of z with respect to y

	//dzdx (x^2 - 2xi + i^2 + y^2 - 2yj + j^2 + z^2 - 2zk + k^2) =
	//2x - 2i + 2z*dzdx - 2k*dzdx
	//dzdx (r^2) = 0
	//we are then left with the equation 2x - 2i + 2z*dzdx - 2k*dzdx = 0
	//we want to isolate dzdx
	//2z*dzdx - 2k*dzdx = -(2x + 2i)
	//dzdx(2z - 2k) = -2x + 2i
	//dzdx = (-2x + 2i) / (2z - 2k)

	//dzdy (x^2 - 2xi + i^2 + y^2 - 2yj + j^2 + z^2 - 2zk + k^2) =
	//2y - 2j + 2z*dzdy - 2k*dzdy
	//dzdy (r^2) = 0
	//2y - 2j + 2z*dzdy - 2k*dzdy = 0
	//2z*dzdy - 2k*dzdy = -(2y - 2j)
	//dzdy(2z - 2k) = -2y + 2j
	//dzdy = (-2y + 2j) / (2z - 2k)

	let dzdx = (-2 * point.x + 2 * sphere.position.x) / (2 * point.z - 2 * sphere.position.z);
	let dzdy = (-2 * point.y + 2 * sphere.position.y) / (2 * point.z - 2 * sphere.position.z);

	let vec1 = new Vector3D(1, 0, 1 * dzdx);
	let vec2 = new Vector3D(0, 1, 1 * dzdy);
	vec1.normalizeIt();
	vec2.normalizeIt();
	
	let normal = vectorCrossproduct(vec1, vec2);
}

function reflections(point, directionVector, normal, bufferX)
{
	let newDirectionVector = reflect(point, directionVector, normal);

	for(let i = 0; i < spheres.length; i++)
	{
		sphereIntersect(point, newDirectionVector, spheres[i], bufferX, 0.4);
	}

	let color = colorBuffer[bufferX];

	color.scaleIt(1 / hitBuffer[bufferX]);

	colorBuffer[bufferX] = color;
}

function reflect(point, vector, normal)
{
	let scalar = vectorDotproduct3D(vector, normal);
	scalar *= 2;

	normal.scaleIt(scalar);

	let directionVector = vectorSubtract3D(normal, vector);

	return vectorAdd3D(directionVector, point)
}

function setup()
{
	createCanvas(width, height);
	background(0);
	noStroke();
}

function draw()
{
	for(let i = 0; i < width * height; i++)
	{
		zBuffer[i] = new Vector3D(Infinity, Infinity, Infinity);
		colorBuffer[i] = new Vector3D(0, 0, 0);
		hitBuffer[i] = 0.01;
	}

	let forward = (height / 2) / Math.tan(tau / 16);

	for(let y = -height / 2; y < height / 2; y++)
	{
		for(let x = -width / 2; x < width / 2; x++)
		{
			let startVector = new Vector3D(0, 0, 0);
			let forwardVector = new Vector3D(x, y, forward)

			let screenX = x + width / 2;
			let screenY = y + height / 2;

			let bufferX = width * screenY + screenX;
			//console.log(bufferX);

			sphereIntersect(startVector, forwardVector, spheres[0], bufferX, 1);
			sphereIntersect(startVector, forwardVector, spheres[1], bufferX, 1);
			sphereIntersect(startVector, forwardVector, spheres[2], bufferX, 1);
			floorIntersect(startVector, forwardVector, bufferX);

			let color = colorBuffer[bufferX];
			//color.scaleIt(1 / hitBuffer[bufferX]);

			fill(color.x, color.y, color.z);
			rect(screenX, height - screenY, 1, 1);
		}
	}
}
