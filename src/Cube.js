var Cube = function( box ) {

	this.box = box;
	this.vertices = [];

	var i;

	for ( i = 0; i < 24; i++ ) {

		this.vertices.push( vec3.add(
			box.position, 
			Cube.vertexVectors[i],
			vec3.create()
		) );

	}

};

Cube.prototype = {

	vector : vec3.create(),
	vector2 : vec3.create(),
	vector3 : vec3.create(),

	distanceToRay : function( origin, direction ) {

		vec3.subtract( this.box.position, origin, this.vector );
		vec3.scale( direction, vec3.dot( direction, this.vector ), this.vector2 );

		vec3.subtract( this.vector, this.vector2 );

		return vec3.lengthSquared( this.vector );

	},

	intersectsRay : function( origin, direction ) {

		var i, j, t,
			normals = Cube.normalVectors,
			normal,
			vertices = this.vertices,
			p = this.vector,
			a = this.vector2,
			b = this.vector3,
			dotaa, dotab, dotap, dotbb, dotbp,
			invDenom, u, v;

		for ( i = 0; i < 6; i++ ) {

			j = i * 4;

			normal = normals[i];

			t = vec3.dot( normal, vertices[j] ) - vec3.dot( normal, origin );
			t /= vec3.dot( normal, direction );

			if ( t ) {

				vec3.add( vec3.scale( direction, t, p ), origin );

				vec3.subtract( p, vertices[j] );
				vec3.subtract( vertices[j + 1], vertices[j], a );
				vec3.subtract( vertices[j + 3], vertices[j], b );

				dotaa = vec3.dot( a, a );
				dotab = vec3.dot( a, b );
				dotap = vec3.dot( a, p );
				dotbb = vec3.dot( b, b );
				dotbp = vec3.dot( b, p );

				invDenom = 1 / ( dotaa * dotbb - dotab * dotab );

				u = ( dotbb * dotap - dotab * dotbp ) * invDenom,
				v = ( dotaa * dotbp - dotab * dotap ) * invDenom;

				if ( u > 0 && v > 0 && u < 1 && v < 1 ) {

					return true;

				}

			}

		}

		return false;

	}

};

Cube.init = function() {

	this.vertices = new Float32Array([

		// front
		1, 1, 1,
		1, -1, 1,
		1, -1, -1,
		1, 1, -1,

		// back
		-1, 1, 1,
		-1, 1, -1,
		-1, -1, -1,
		-1, -1, 1,

		// right
		1, 1, 1,
		1, 1, -1,
		-1, 1, -1,
		-1, 1, 1,

		// left
		1, -1, 1,
		-1, -1, 1,
		-1, -1, -1,
		1, -1, -1,

		// top
		1, 1, 1,
		-1, 1, 1,
		-1, -1, 1,
		1, -1, 1,

		// bottom
		1, 1, -1,
		1, -1, -1,
		-1, -1, -1,
		-1, 1, -1

	]);

	var i;

	for ( i = 0; i < 72; i++ ) {

		this.vertices[i] /= 2;

	}


	this.vertexVectors = [];

	var vV = this.vertexVectors,
		v = this.vertices,
		j;

	for ( i = 0; i < 24; i++ ) {

		j = i * 3;

		vV.push( vec3.assign(
			vec3.create(), 
			v[j],
			v[j + 1],
			v[j + 2]
		) );

	}


	this.normals = new Float32Array([

		// front
		1, 0, 0,
		1, 0, 0,
		1, 0, 0,
		1, 0, 0,

		// back
		-1, 0, 0,
		-1, 0, 0,
		-1, 0, 0,
		-1, 0, 0,

		// right
		0, 1, 0,
		0, 1, 0,
		0, 1, 0,
		0, 1, 0,

		// left
		0, -1, 0,
		0, -1, 0,
		0, -1, 0,
		0, -1, 0,

		// top
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,

		// bottom
		0, 0, -1,
		0, 0, -1,
		0, 0, -1,
		0, 0, -1

	]);

	this.normalVectors = [];

	var nV = this.normalVectors,
		n = this.normals;

	for ( i = 0; i < 24; i++ ) {

		j = i * 12;

		nV.push( vec3.assign(
			vec3.create(), 
			n[j],
			n[j + 1],
			n[j + 2]
		) );

	}


	this.indices = new Uint16Array([

		// front
		0, 1, 2, 0, 2, 3,

		// back
		4, 5, 6, 4, 6, 7,

		// right
		8, 9, 10, 8, 10, 11,

		// left
		12, 13, 14, 12, 14, 15,

		// top
		16, 17, 18, 16, 18, 19,

		// bottom
		20, 21, 22, 20, 22, 23

	]);

	// this.vertexBuffer = gl.createBuffer();
	// 
	// gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	// 
	// this.normalBuffer = gl.createBuffer();
	// 
	// gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
	// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	// 
	// this.indexBuffer = gl.createBuffer();
	// 
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
	// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STREAM_DRAW);
	// 
	// this.indexBuffer.count = indices.length;
	// 
	// this.lineIndexBuffer = gl.createBuffer();
	// 
	// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.lineIndexBuffer);
	// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lineIndices), gl.STREAM_DRAW);
	// 
	// this.lineIndexBuffer.count = lineIndices.length;
	
};