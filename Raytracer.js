function setup()
{
	background(0);
	size(300, 230);
}

function draw()
{

}

class Vector3D
{
  	constructor(x, y, z)
	{
    	this.x = x;
    	this.y = y;
    	this.z = z;
  	}

	scale(c)
	{
		this.x *= c;
		this.y *= c;
		this.z *= c;
	}

	magnitude()
	{
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	squaredMagnitude()
	{
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}

	normalizeIt()
	{
    	//normalizes the vector
    	let magnitude = this.magnitude();

    	this.x /= magnitude;
    	this.y /= magnitude;
    	this.z /= magnitude;
	}

	normalized()
	{
		//gives back a normalized version of the vector
		let magnitude = this.magnitude();
		return Vector3D(this.x / magnitude, this.y / magnitude, this.z / magnitude);
	}
}

class Sphere
{
    //position och color ska vara Vector3D
	constructor(radius, position, color, reflectivity)
	{
    	this.radius = radius;
    	this.position = position;
    	this.color = color;
    	this.reflectivity = reflectivity;
	}
}

function vectorAdd3D(vector1, vector2)
{
	return Vector3D(vector1.x + vector2.x, vector1.y + vector2.y, vector1.z + vector2.z);
}

function vectorSubtract3D(vector1, vector2)
{
	return Vector3D(vector1.x - vector2.x, vector1.y - vector2.y, vector1.z - vector2.z);
}

function vectorDotproduct3D(vector1, vector2)
{
	return vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
}

function vectorCrossproduct(v1, v2)
{
	return Vector3D(v1.y * v2.z + v1.z * v2.y, v1.z * v2.x + v1.x * v2.z, v1.x * v2.y + v1.y * v2.x);
}

function sphereIntersect(startPos, endPos, sphere)
{
	let dzdx = (endPos.x - startPos.x) / (endPos.z - startPos.z);
	let dzdy = (endPos.y - startPos.y) / (endPos.z - startPos.z);

	//We will abreviate som terms here for the sake of shortening the mess that is about to happen
	//sx = startPos.x
	//sy = startPos.y
	//sz = startPos.z
	//i = sphere.position.x
	//j = sphere.position.y
	//k = sphere.position.z
	//r = sphere.radius

	//for some value z, this equation must have a real answer if the ray is
	//intersecting the sphere at the point (z * dzdx + sx, z * dzdy + sy, z + sz)

	//((z * dzdx) + sx - i)^2 + ((z * dzdy) + sy - j)^2 + (z + sz - k)^2 = r^2

	//here z is the unkown we want to solve for

	//expanding this equation we get:

  	//(z * dzdx)^2 + 2(z * dzdx)(sx - i) + (sx - i)^2 +
	//(z * dzdy)^2 + 2(z * dzdy)(sy - j) + (sy - j)^2 +
	//z^2 + 2z(sz - k) + (sz - k)^2 = r^2

	//we want this to be in this format:
	//az^2 + bz + c - r^2 = 0

	//z^2 * dzdx * dzdx + z * 2 * dzdx * (sx - i) + (sx - i) * (sx - i) +
	//z^2 * dzdy * dzdy + z * 2 * dzdy * (sy - j) + (sy - j) * (sy - j) +
	//z^2 + z * 2 * (sz - k) + (sz - k) * (sz - k) = r * r

	//za + zb + z = z(a + b + 1)

	//we then get that:

	//a = dzdx * dzdx + dzdy * dzdy + 1
	//b = 2 * dzdx * (sx - i) + 2 * dzdy * (sy - j) + 2 * (sz - k)
	//c = (sx - i) * (sx - i) + (sy - j) * (sy - j) + (sz - k) * (sz - k) - r * r

	let a = dzdx * dzdx + dzdy * dzdy + 1;

	let b = 2 * dzdx * (startPos.x - sphere.position.x) +
	2 * dzdy * (startPos.y - sphere.position.y) +
	2 * (startPos.z - sphere.position.z);

	let c = (startPos.x - sphere.position.x) * (startPos.x - sphere.position.x) +
	(startPos.y - sphere.position.y) * (startPos.y - sphere.position.y) +
	(startPos.z - sphere.position.z) * (startPos.z - sphere.position.z) - sphere.radius * sphere.radius;

	let insideOfRoot = b * b - 4 * a * c;

	//if this number is negative, then taking the root of it will give
	//an imaginary number which means that there is no intersection
	if(insideOfRoot < 0) return null;

	let root = sqrt(insideOfRoot)

	//we can now solve for the roots of the equation using the quadtratic formula

	let z1 = (-b + root) / (2 * a);
	let z2 = (-b - root) / (2 * a);

	let vec1 = (z1 * dzdx, z1 * dzdy, z1);
	let vec2 = (z2 * dzdx, z2 * dzdy, z2);

	let intersection;

	//we check which of the two vectors is the shortest to know which one we should use
	//to calculate the closest intersection with the sphere
	if(vec1.magnitude() < vec2.magnitude())
	{
		intersection = vectorAdd3D(vec1, startPos);
	}
	else
	{
		intersection = vectorAdd3D(vec2, startPos);
	}

	return intersection;
}

function sphereTangent()
{

}

function reflect(vector, tangent)
{

}
