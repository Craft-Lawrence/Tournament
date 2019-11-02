$(document).ready(function () {

});




new Vue({
	el: '#app',
	data: {
		devMode:		false, // само "кликает" по кнопкам
		maxWarriors:	8, 
		offset:			17,
		regenerateHP:	true,
		
		settings: {

			minAttack:	3,
			maxAttack:	12,
			minDefence: 3,
			maxDefence: 8,

			maxHealth:	30,
		},

		warriors: 		[],
		tournamentList: [
			/* [1,2,3,4,5,6,7,8],
			[1,2,3,4],
			[1,2],
			[1], */
		],
	},
	computed: {
		tournamentListText() { // строю турнирную таблицу
			let result	= [];
			let counter = this.maxWarriors; // начинаем с общего числа участников
			let	j		= 0; // этапы турнира

			while ( counter >= 1 ) { // до тех пор, пока участников > 1
				var tempRes	= [];
				for (let i = 0; i < counter; i++) {
					if ( this.tournamentList[j] && this.tournamentList[j][i] )
						tempRes.push( this.tournamentList[j][i].id );
					else
						tempRes.push( '?' );
				}
				result[j]	= tempRes;

				counter = counter / 2;
				j++;
			}

			return result;
		},

		showButton() {
			let result	= false;
			if ( this.tournamentList[this.tournamentList.length-1] )
				result		= this.tournamentList[this.tournamentList.length-1][0] === false;
			return result;
		},
	},
	methods: {
		random(min, max) {
			let rand = min + Math.random() * (max + 1 - min);
			return Math.floor(rand);
		},

		stageMargin(i) { // магия
			let margin 		= 0,
				k			= 0,
				countFirst	= this.maxWarriors;
			
			for ( let z = i; z > 0; z-- )
				k	= k + (countFirst / this.tournamentListText[i-z].length);

			margin	= k * this.offset;
			return margin+'px';
		},
		warriorMargin(i,j) { // магия
			let margin 		= 0,
				k			= 0,
				countFirst	= this.maxWarriors;
			
			if ( j > 0 ) {
				for ( let z = i; z > 0; z-- )
					k	= k + (countFirst / this.tournamentListText[i-z].length);
			}

			margin	= k * 2 * this.offset;
			return margin+'px';
		},
		lineBefore(i) { // Степени двойки!!
			let height 		= 0;
			height	= (Math.pow(2,i) * this.offset)+2;
			return height+'px';
		},
		warriorHealthPoints( warrior ) {
			return warrior.health * 100 / warrior.maxHealth +'%';
		},

		hireWarriors() {
			this.warriors	= [];
			for (let i = 0; i < this.maxWarriors; i++) {
				this.warriors.push({
					id:			i+1,
					attack:		this.random(this.settings.minAttack, this.settings.maxAttack),
					defence: 	this.random(this.settings.minDefence, this.settings.maxDefence),
					health:		this.settings.maxHealth,
					maxHealth:	this.settings.maxHealth,
				});
			}
			this.tournamentList	= [];
		},

		makeTournamentList() {
			let copy	= this.warriors.concat();
			this.tournamentList		= [];
			copy.sort(function(){
				return Math.random() - 0.5;
			});
			this.tournamentList[0]	= copy;

			// "лечу" всех воинов
			for (let i = 0; i < this.warriors.length; i++) {
				this.warriors[i].health	= this.warriors[i].maxHealth;
			}
			// /"лечу" всех воинов

			let count	= this.maxWarriors / 2; // сразу пропускаю первый "раунд"
			let counter	= 1;
			do {
				var tempArr	= [];
				for (let i = 0; i < count; i++) {
					tempArr.push(false);
				}
				this.tournamentList.push( tempArr )
				count = count / 2;
				counter++;
			}
			while ( count >= 1 );
		},

		makeOneFight() {
			let round	= false,
				w1,
				w2;
			mainLoop:
			for (let i = 0; i < this.tournamentList.length; i++) {
				const el	= this.tournamentList[i];
				for (let j = 0; j < el.length; j++) {
					const item = el[j];
					if ( !item ) {
						round	= i - 1;
						w1		= j * 2;
						w2		= w1 + 1;

						this.singleBattle( round,w1, round,w2 );
						break mainLoop;
					}
				}
			}
		},
		makeTournament() {
			let fuse	= 0, // предохранитель от вечного цикла
				rounds	= this.tournamentList.length;
			while ( this.tournamentList[rounds-1] !== false && fuse < 10000 ) {
				this.makeOneFight();
				fuse++;
			}
		},

		singleBattle( w11,w12, w21,w22 ) { // Передаю координаты бойцов в сетке
			let warID1		= this.tournamentListText[w11][w12]-1,
				warID2		= this.tournamentListText[w21][w22]-1;
			if ( this.regenerateHP ) { // регенерация здоровья
				this.warriors[warID1].health	= this.warriors[warID1].maxHealth;
				this.warriors[warID2].health	= this.warriors[warID2].maxHealth;
			}
			let	warrior1	= this.warriors[warID1],
				warrior2	= this.warriors[warID2],
				round		= 1;

			//setTimeout( () => {
				while ( warrior1.health > 0 && warrior2.health > 0 ) { // пока оба "на ногах"..
					var	atk1	= this.random( warrior1.attack*0.5, warrior1.attack*1.5 ), // Уровень атаки первого бойца
						atk2	= this.random( warrior2.attack*0.5, warrior2.attack*1.5 ), // Уровень атаки второго бойца
						damage1	= Math.round(atk1 * (1 - warrior2.defence / 10)),
						damage2	= Math.round(atk2 * (1 - warrior1.defence / 10)),
						text	= '';

					console.log( `= Раунд ${round} ====================================================` );
					text		= `Первый боец (ЖЗН:${warrior1.health} / АТК:${warrior1.attack} / ЗЩТ:${warrior1.defence}) `;
					text		+= `атакует второго бойца (ЖЗН:${warrior2.health} / АТК:${warrior2.attack} / ЗЩТ:${warrior2.defence}) `;
					text		+= `с уроном ${atk1} и наносит ${damage1} повреждений`;
					console.log( text );

					text		= `Второй боец (ЖЗН:${warrior2.health} / АТК:${warrior2.attack} / ЗЩТ:${warrior2.defence}) `;
					text		+= `атакует первого бойца (ЖЗН:${warrior1.health} / АТК:${warrior1.attack} / ЗЩТ:${warrior1.defence}) `;
					text		+= `с уроном ${atk2} и наносит ${damage2} повреждений`;
					console.log( text );

					warrior1.health = warrior1.health - damage2; if ( warrior1.health < 0 ) warrior1.health = 0;
					warrior2.health = warrior2.health - damage1; if ( warrior2.health < 0 ) warrior2.health = 0;
					round++;
				}

				console.log( `==============================================================` );
				if ( warrior1.health == 0 && warrior2.health == 0 ) {
					console.log('Ничья!');
					// TODO: учесть это
				}
				else if ( warrior1.health == 0 ) {
					console.log('Второй боец победил!');
					this.tournamentList[w11+1][w12/2]	= warrior2;
					this.tournamentList.splice( w11+1, 1, this.tournamentList[w11+1] )
				}
				else {
					console.log('Первый боец победил!');
					this.tournamentList[w11+1][w12/2]	= warrior1;
					this.tournamentList.splice( w11+1, 1, this.tournamentList[w11+1] )
				}
			//}, 1000);
		}
	},
	mounted: function () {
		if ( this.devMode ) { // Делаю все действия сразу после обновления страницы потомуша лень кляцать
			this.hireWarriors();
			this.makeTournamentList();
			this.makeTournament();
		}
	},
});