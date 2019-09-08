class Level {
	constructor(game, n) {
		this.game = game;
		this.map = new LevelMap(n);
		this.tiles = [];
		this.entities = [];
		this.ringsCollected = 0;
		this.player = new Player(this.game, this.map.player);
		this.entities.push(this.player);
		this.game.checkpoint = {x: this.map.player.x * Tile.size, y: this.map.player.y * Tile.size};
		if (this.map.enemies) {
      		for (let enemy of this.map.enemies) {
        		this.entities.push(new Enemy(this.game, enemy.x * Tile.size, enemy.y * Tile.size));
      		}
    	}
	}

	getCoords(x, y) {
		const i = Math.floor(x / Tile.size);
		const j = Math.floor(y / Tile.size);
		return [i, j];
	}

	inBounds(i, j) {
		if (i < 0 || i >= this.map.tiles[0].length)
			return false;
		
		if (j < 0 || j >= this.map.tiles.length)
			return false;

		return true;
	}

	getTile(x, y) {
		const [i, j] = this.getCoords(x, y);

		if (!this.inBounds(i, j))
			return ' ';

		return this.map.tiles[j][i];
	}

	clearTile(x, y, z) {
		const [i, j] = this.getCoords(x, y);
		const k = z || ' ';

		if (this.inBounds(i, j)) {
			const line = this.map.tiles[j];
			this.map.tiles[j] = line.slice(0, +(i - 1) + 1 || undefined) + k + line.slice(i + 1);
		}
	}

	update() {
		this.entities.map(entity => entity.update());
	}

	showGbar() {
		const gbarCtx = this.game.canvas.gbarCtx;
		gbarCtx.drawImage(this.game.canvas.gbarLife, 10, 5, 26, 26);
		gbarCtx.fillStyle = '#fff';
		gbarCtx.font = '26px Arial';
		gbarCtx.textAlign = 'left';
		gbarCtx.fillText('X ' + this.game.lives, 42, 28);

		let ringX;
		for (let j = 0; j < (this.map.rings - this.ringsCollected); j++) {
			ringX = 100 + (j * 15);
			gbarCtx.drawImage(this.game.canvas.gbarRing, ringX, 5, 11, 26);	
		}
		gbarCtx.textAlign = 'right';
		gbarCtx.fillText(this.game.score, 620, 28);

		gbarCtx.font = '18px Arial';
		gbarCtx.fillText('LEVEL ' + (this.game.currentLevel + 1), 380, 24);
	}
	
	draw() {

		this.showGbar();

		let playerX = Math.floor(this.player.x);
		let dx;
		if(playerX <= 297){
			dx = 0;
		}
		else if(playerX >= (Tile.size * this.map.tiles[0].length - 342)) {
			dx = Tile.size * this.map.tiles[0].length - 640;
		}
		else{
			dx = this.player.x - 297;
		}

		this.game.canvas.setScroll(dx);
		
		for (let j = 0; j < this.map.tiles.length; j++) {
			const line = this.map.tiles[j];
			for (let i = 0; i < line.length; i++) {
				const tile = line[i];
				this.drawTile(tile, i, j);

				if (tile === 'G') {
					if (Math.ceil(this.ringsCollected / 2) === this.map.rings) {
						const nextLine = this.map.tiles[j + 1];
						this.player.passedAllRings = true;
						this.map.tiles[j] = line.slice(0, +(i - 1) + 1 || undefined) + '=' + line.slice(i + 1);
						this.map.tiles[j + 1] = nextLine.slice(0, +(i - 1) + 1 || undefined) + '$' + nextLine.slice(i + 1);
					}
				}
			}
		}

		for (let entity of this.entities) {
			if (entity.dead) {
				let index = this.entities.indexOf(entity);
				this.entities.splice(index, 1);
			}
		}

		this.entities.map(entity => entity.draw());
	}

	drawTile(tile, i, j) {
		this.game.canvas.drawTile(tile, i, j);
	}
}