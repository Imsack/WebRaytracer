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

function sphereIntersect()
{
  
}

function sphereTangent()
{

}

function reflect(vector, tangent)
{

}
