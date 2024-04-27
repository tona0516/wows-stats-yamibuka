const MAX_RETRY = 5;

function shiptypr(val1,val2,val3,val4,val_sw){
	document .getElementById("sw1").style .border="outset 3px";
	document .getElementById("sw2").style .border="outset 3px";
	document .getElementById("sw3").style .border="outset 3px";
	document .getElementById("sw4").style .border="outset 3px";
	document .getElementById("sw5").style .border="outset 3px";
	document .getElementById(val_sw).style .border="inset 3px";
	if ( val1 ){
		cv ="none";
	}else {
		cv = "";
	}
	if ( val2 ){
		bb ="none";
	}else {
		bb = "";
	}
	if ( val3 ){
		cl ="none";
	}else {
		cl = "";
	}
	if ( val4 ){
		dd ="none";
	}else {
		dd = "";
	}
	var elements = document.getElementsByName("AirCarrier");
	for (var i=0; i<elements.length ; i++) {
		document .getElementsByName( "AirCarrier" )[i]. style . display = cv;
	}
	var elements = document.getElementsByName("Battleship");
	for (var i=0; i<elements.length ; i++) {
		document .getElementsByName( "Battleship" )[i]. style . display = bb;
	}
	var elements = document.getElementsByName("Cruiser");
	for (var i=0; i<elements.length ; i++) {
		document .getElementsByName( "Cruiser" )[i]. style . display = cl;
	}	var elements = document.getElementsByName("Destroyer");
	for (var i=0; i<elements.length ; i++) {
		document .getElementsByName( "Destroyer" )[i]. style . display = dd;
	}
}

function idhide(val1,val2){
	if ( val1 ){
		idp ="none";
		buta ="";
	}else {
		idp = "";
		buta ="none";
	}
	var el = document.getElementsByName("user_own");
	for (var i=0; i<el.length ; i++) {
		document .getElementsByName( "user_own" )[i]. style . display = idp;
	}
	var el = document.getElementsByName("user_ene");
	for (var i=0; i<el.length ; i++) {
		document .getElementsByName( "user_ene" )[i]. style . display = idp;
	}
	var el = document.getElementsByName("user_buta");
	for (var i=0; i<el.length ; i++) {
		document .getElementsByName( "user_buta" )[i]. style . display = buta;
	}

	if ( val2 ){
		btp ="none";
		asu ="";
	}else {
		btp ="";
		asu ="none";
	}
	var el = document.getElementsByName("battle_suu");
	for (var i=0; i<el.length ; i++) {
		document .getElementsByName( "battle_suu" )[i]. style . display = btp;
	}
	var el = document.getElementsByName("battle_asu");
	for (var i=0; i<el.length ; i++) {
		document .getElementsByName( "battle_asu" )[i]. style . display = asu;
	}
}

function shipname_ex(val){
	if ( val ){
		dispeng ="none";
		dispjp="";
	}else {
		dispeng ="";
		dispjp="none";
	}
	var el = document.getElementsByName("shipname_jp");
	for (var i=0; i<el.length ; i++) {
		document .getElementsByName( "shipname_jp" )[i]. style . display = dispjp;
	}
	var el = document.getElementsByName("shipname_eng");
	for (var i=0; i<el.length ; i++) {
		document .getElementsByName( "shipname_eng" )[i]. style . display = dispeng;
	}
}

function myFormatNumber(x) {
	var s = "" + x;
	var p = s.indexOf(".");
	if (p < 0) {
		p = s.length;
	}
	var r = s.substring(p, s.length);
	for (var i = 0; i < p; i++) {
        var c = s.substring( p- 1 - i, p - 1 - i + 1);
		if (c < "0" || c > "9") {
			r = s.substring(0, p - i) + r;
			break;
 		}
		if (i > 0 && i % 3 == 0) {
			r = "," + r;
		}
		r = c + r;
	}
	return r;
}

function short_id(str){
	if (str.length < 12)	{
		return(str);
	}
	return (str.substring(0,10)+"...");
}

function countLength(str) {
	var r = 0;
	for (var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
			r += 1;
		} else {
			r += 2;
		}
	}
	return r;
}

var app = angular.module('wows-stats', []);

var game_tier = 1;

app.factory('api', function($http, $q) {
	var api = {};
	var cv_match_flag = false;
	api.fetchShip = function(player) {
		player.api.ship = api.ship(player);
		player.api.ship.then(function(player){
			// nothing needs to be done after fetching ship stats
		}, function(player){
			// retry if rejected
			if (!player.ship)
				player.ship = {};
			if (!player.ship.hasOwnProperty('retry'))
				player.ship.retry = MAX_RETRY;
			if (player.ship.retry > 0) {
				player.ship.retry --;
				api.fetchShip(player);
			}
			else {
				// report error if max retry reached
				if (player.api.ship.status == 404)
					player.ship.err = "戦闘記録無し";
				else if(player.api.ship.response.message)
					player.ship.err = player.api.ship.response.message;
				else if(player.api.ship.response.error)
					player.ship.err = player.api.ship.response.error.message;
				else
					player.ship.err = player.api.ship.response;
			}
		});
	}
	api.fetchPlayer = function(player) {
		player.api.player = api.player(player);
		player.api.player.then(function(player) {
			// fetch ship stats after player fetching is done so we have the proper playerId
			api.fetchShip(player);
		}, function(player) {
			// retry if rejected
			if (!player.hasOwnProperty('retry'))
				player.retry = MAX_RETRY;
			if (player.retry <= 0 || player.api.status == 401) {
				// report error if max retry reached or player profile is private
				player.ship = {};
				if (player.api.status == 401) {
					player.err = "非公開";
				}
				else if (player.api.response.message) {
					player.err = player.api.response.message;
				}
				else if(player.api.response.error) {
					player.err = player.api.response.error.message;
				}
				else {
					player.err = player.api.response;
				}
				if (player.api.response.hasOwnProperty("id")){
					// playerId is available
					angular.extend(player, player.api.response);
					player.uri = player.id + '-' + encodeURIComponent(player.name);
					api.fetchShip(player);
				}
				else {
					// report the same error to ship since we can't fetch ship without playerId
					player.ship.err = player.err;
				}
			}
			else {
				player.retry --;
				api.fetchPlayer(player);
			}
		});
	}

	api.shipnamejp = function(type, value) {
		var sneng =[
			"Hashidate","Chikuma","Tenryu","Kuma","Furutaka",
			"Aoba","Myoko","Mogami","Ibuki","Zao",
			"Umikaze","Wakatake","Isokaze","Minekaze",
			"Mutsuki","Hatsuharu","Fubuki","Kagero","Shimakaze",
			"Kawachi","Myogi","Kongo","Fuso","Nagato","Amagi","Izumo","Yamato",
			"Hosho","Zuiho","Ryujo","Hiryu","Shokaku","Taiho","Hakuryu",
			"Mikasa","Yūbari","Ishizuchi","Fujin","Kamikaze","Atago",
			"Tachibana","Iwaki Alpha","Kamikaze R","Fūjin",
			"ARP Kongō","ARP Hiei","ARP Haruna","ARP Kirishima",
			"ARP Myoko","ARP Haguro","ARP Ashigara","ARP Nachi",
			"ARP Takao","ARP Atago","ARP Maya","ARP Chokai","ARP Chōkai",
			"Tone","Akatsuki","Shiratsuyu","Akizuki","Yugumo","Yūgumo","Shinonome",
			"Anshan","Lo Yang",
			"Arkansas Beta","Tachibana Lima","Marblehead Lima","Imperator Nikolai I"
		];
		var snjp = [
			"橋立","筑摩","天龍","球磨","古鷹",
			"青葉","妙高","最上","伊吹","蔵王",
			"海風","若竹","磯風","峯風",
			"睦月","初春","吹雪","陽炎","島風",
			"河内","妙義","金剛","扶桑","長門","天城","出雲","大和",
			"鳳翔","瑞鳳","龍驤","飛龍","翔鶴","大鳳","白龍",
			"三笠","夕張","石鎚","風神","神風","愛宕",
			"橘","岩木.α","神風.Ｒ","風神",
			"ARPコンゴウ(金剛)","ARPヒエイ（金剛）","ARPハルナ（金剛）","ARPキリシマ(金剛)",
			"ARPミョウコウ(妙高)","ARPハグロ(妙高)","ARPアシガラ(妙高)","ARPナチ(妙高)",
			"ARPタカオ(愛宕)","ARPアタゴ(愛宕)","ARPマヤ(愛宕)","ARPチョウカイ(愛宕)","ARPチョウカイ(愛宕)",
			"利根","暁","白露","秋月","夕雲","夕雲","東雲",
			"鞍山","洛陽",
			"Arkansas.β","橘.Ｌ","Marblehead.Ｌ","Nikolai I"
		];
		// 複数回書いてあるものは表記揺れ対策、おいら運営じゃないんで未実装艦は予想でしか書けません

		for (var i=0; i<sneng.length ; i++) {
			if (value == sneng[i]) {
				return snjp[i];
				brake;
			}
		}
		return value;
	}

	api.shiptypejp_s = function(type, value) {
		if (value == 'Destroyer') {
			return '駆';
		}
		else if(value == 'Cruiser') {
			return '巡';
		}
		else if(value == 'Battleship') {
			return '戦';
		}
		else if(value == 'AirCarrier') {
			api.cv_match_flag = true;
			return '空';
		}
		else return value;
	}

	api.nationjp_s = function(str) {
		var ntname =[
			["japan","日"] ,["usa","米"] ,["ussr","ソ"],["germany","独"] ,
			["uk","英"],["france","仏"] ,["poland","波"],["pan_asia","ア"] ,
			["italy","伊"],["australia","豪"],["commonwealth","連"],
			["netherlands","蘭"],["spain","西"]
		]
		for (var i=0; i<ntname.length ; i++) {
			if (str == ntname[i][0]) {
				return ntname[i][1];
				brake;
			}
		}
		return '他';
	}

	api.shipnamefont = function(value) {
		if (value < 7) {
			return 'ship_font_6';
		}
		else if(value < 10) {
			return 'ship_font_9';
		}
		else if(value < 15) {
			return 'ship_font_14';
		}
		else return 'ship_font_20';
	}

	api.beautify = function(type, value) {
		// xvm like colorization
		switch(type) {
			case "winRate":
				if	(value < 47) {
					return 'class1';
				}
				else if(value < 49) {
					return 'class2';
				}
				else if(value < 52) {
					return 'class3';
				}
				else if(value < 57) {
					return 'class4';
				}
				else if(value < 65) {
					return 'class5';
				}
				else if(value < 101) {
					return 'class6';
				}
				break;
			default:
				return null;
				break;
		}
	}

	api.mapname_ex_jp = function(type, value) {

		var mapname =[
			["i01_tutorial",		"チュートリアル"] ,
			["00_CO_ocean",			"大海原"],
			["01_solomon_islands",	"ソロモン諸島"],
			["04_Archipelago",		"列島"],
			["08_NE_passage",		"海峡"],
			["10_NE_big_race",		"ビッグレース"],
			["13_OC_new_dawn",		"新たなる夜明け"],
			["14_Atlantic",			"大西洋"],
			["15_NE_north",			"北方"],
			["16_OC_bees_to_honey",	"ホットスポット"],
			["17_NA_fault_line",	"断層線"],
			["18_NE_ice_islands",	"氷の群島"],
			["19_OC_prey",			"罠"],
			["20_NE_two_brothers",	"二人の兄弟"],
			["22_tierra_del_fuego",	"火の地"],
			["23_Shards",			"破片"],
			["25_sea_hope",			"幸運の海"],
			["28_naval_mission",	"砂漠の涙"],
			["33_new_tierra",		"極地"],
			["34_OC_islands",		"群島"],
			["35_NE_north_winter",	"北極光（北方冬ver）"],
			["37_Ridge",			"山岳地帯"],
			["38_Canada",			"粉砕"],
			["40_Okinawa",			"沖縄"],
			["41_Conquest",			"トライデント"],
			["42_Neighbors",		"隣接勢力"],
			["44_Path_warrior",		"戦士の道"],
			["45_Zigzag",			"ループ"],
			["46_Estuary",			"河口"]
		]
		for (var i=0; i<mapname.length ; i++) {
			if (value == mapname[i][0]) {
				return mapname[i][1];
				brake;
			}
		}
		return value;
	}

	api.sinarioname_ex_jp = function(type, value) {
		var snname =[
			["Default_test","チュートリアル"] ,
			["Skirmish_Domination_2_BASES","通常-Coop戦"] ,
			["Domination_2_BASES","通常戦"],
			["Skirmish_MegaBase","ゾーン-Coop戦"] ,
			["MegaBase","ゾーン戦"],
			["Skirmish_Domination","制圧-Coop戦"] ,
			["Domination","制圧戦"],
			["Skirmish_Epicenter","中央攻略-Coop戦"] ,
			["Epicenter","中央攻略戦"],
			["Ranked_Domination","ランク戦"]
		]
		for (var i=0; i<snname.length ; i++) {
			if (value == snname[i][0]) {
				return snname[i][1];
				brake;
			}
		}
		return value;
	}


	api.player = function(player) {
		return $q(function(resolve, reject) {
			$http({
				method:'GET',
				url: 'http://localhost:8080/api/player?name=' + encodeURIComponent(player.name)
			}).success(function(data, status) {
				angular.extend(player, data);
				player.uri = player.id + ',' + encodeURIComponent(player.name);
				var winRate = parseFloat(player.winRate.replace('%', ''));
				player.winRateClass = api.beautify("winRate", winRate);
				player.formatbattle = myFormatNumber(parseInt(player.battles));
				player.formatdmg = myFormatNumber(parseInt(player.avgDmg));
				player.formatexp = myFormatNumber(parseInt(player.avgExp));
				resolve(player);
			}).error(function(data, status) {
				player.api.response = data;
				player.api.status = status;
				reject(player);
			});
			player.name_s = short_id(player.name);
		});
	}
	api.ship = function(player) {
		return $q(function(resolve, reject) {
			$http({
				method:'GET',
				url: 'http://localhost:8080/api/ship?playerId=' + player.id + '&shipId=' + player.shipId
			}).success(function(data, status) {
				var battles = parseInt(data.battles);
				var victories = parseInt(data.victories);
				var winRate = (victories / battles * 100).toFixed(2);
				var survived = parseInt(data.survived);
				var kill = parseInt(data.destroyed);
				var death = battles - survived;
				var kakin = "";
				var killkoo= "";
				var svrate= "";
				var svgeta="";
				if (death == 0 && kill > 0){
					kdRatio ="∞";
				}else if(death == 0 && kill == 0){
					kdRatio ="－";
				}
				else{
					var kdRatio = (kill / death).toFixed(2);
				}
				if (data.noRecord !=  true ){
					var atkavg = (parseInt(data.destroyed)/ battles).toFixed(1);
					var sdkavg =  (parseInt(data.raw.pvp.planes_killed)/ battles).toFixed(1);
					if (parseInt(data.raw.pvp.main_battery.shots) != 0){
						var hitm = (parseInt(data.raw.pvp.main_battery.hits) / parseInt(data.raw.pvp.main_battery.shots)*100).toFixed(1);
					}
					else{
						var hitm ="－";
					}
					if (parseInt(data.raw.pvp.torpedoes.shots) != 0){
						var hitt = (parseInt("0"+data.raw.pvp.torpedoes.hits) / parseInt("0"+data.raw.pvp.torpedoes.shots)*100).toFixed(1);
					}
					else{
						var hitt ="－";
					}
					if (data.destroyed >4 ){
						killkoo =(parseInt(data.raw.pvp.damage_dealt)/parseInt(data.destroyed)/10000).toFixed(1);
					}else{
						killkoo ="－";
					}
					if ( parseInt(data.victories) >10 && (parseInt(data.battles) - parseInt(data.victories)) >10 ){
						var svwin=((parseInt(data.raw.pvp.survived_wins)/parseInt(data.victories))*100).toFixed(0);
						var svlose=(((parseInt(data.raw.pvp.survived_battles)-parseInt(data.raw.pvp.survived_wins))/(parseInt(data.battles) - parseInt(data.victories)))*100).toFixed(0);
						if (parseInt(svlose)<10){
							svgeta=" ";
						}else{
							svgeta="";
						}
						svrate=svwin+"-"+svgeta+svlose;
					}else{
						svrate="－";
					}
				}
				if (data.info.is_premium != false){
					kakin ="℗";
				}
				var threat_score = api.calcThreatLevel(player, data);
				var clearance = api.calcClearance(threat_score.all);

				player.ship = {
					"shiptia_s": data.info.tier,
					"shipty": data.info.type,
					"shiptype_s": api.shiptypejp_s("shiptype",data.info.type),
					"shipnation_s": api.nationjp_s(data.info.nation),
					"shipkakin": kakin,
					"name": data.name,
					"namejp" :api.shipnamejp("jpname",  data.name),
					"namefont" : api.shipnamefont(countLength(data.name)),
					"namefontjp" : api.shipnamefont(countLength(api.shipnamejp("jpname",data.name))),
					"bgcolor" :data.info.type+"_bg",
					"winRate": winRate + "%",
					"winRateClass": api.beautify("winRate", winRate),
					"shfl" : atkavg,
					"ftfl" : sdkavg,
					"hitratem" : hitm ,
					"hitratet" : hitt ,
					"kdRatio": kdRatio,
					"battles": myFormatNumber(battles),
					"avgExp": myFormatNumber(data.avgExp),
					"avgDmg": myFormatNumber(data.avgDmg),
					"killkoo":killkoo,
					"svrate":svrate,

					"threatLevelPlayer":threat_score.player,
					"threatLevelAll":threat_score.all,
					"threatLevelAaIndex":threat_score.aa_index,
					"threatLevelClass":api.calcClearance(threat_score.player),
					"threatLevelClassShip":api.calcClearance(threat_score.all),
					"threatLevelClassCode":api.getClearance(api.calcClearance(threat_score.player))
				}
				if (data.noRecord)
					player.ship.err = "記録無し";
				resolve(player);
			}).error(function(data, status) {
				player.api.ship.response = data;
				player.api.ship.status = status;
				reject(player);
			});
		});
	}


	//戦力レベル評価
	api.calcThreatLevel = function(player, ship) {
		var threat_level = 1000;
		//基本的に極端な補正は閾値で飽和

		//console.info(player.name);
		//console.log('player:');
		//console.log(player);


		//総合ダメージ補正指数
		var base_damage_score = parseInt(player.avgDmg) / 40000;
		if(base_damage_score > 1.5) {
			base_damage_score = 1.5;
		} else if(base_damage_score < 0.5) {
			base_damage_score = 0.5;
		}

		//補正影響度を半分に
		base_damage_score = round((base_damage_score - 1) / 2);


		//Kill関係数値補正指数
		var kill_score = 0;
		var kdr_score = 0;
		//raw未定義の場合は最低補正を適用
		if(typeof(player.raw) != "undefined") {
			var kpr = parseInt(player.raw.statistics.pvp.frags) / parseInt(player.battles);
			var kdr = parseInt(player.kdRatio);

			//鯖平均値を基準にKPR補正
			if(kpr > 0.8) {
				kill_score = kpr > 1.5 ? 1.5 : kpr;
			} else {
				kill_score = kpr < 0.5 ? 0.5 : kpr;
			}
			kill_score = kill_score - 0.8;

			//鯖平均を基準に計算
			if(kdr > 1.2) {
				kdr_score = kdr > 3 ? 3 : kdr;
			} else {
				kdr_score = kdr < 0.7 ? 0.7 : kdr;
			}
			kdr_score = kdr_score - 1.2;
			//KDRは高いのにKPRは低い（≒芋）は逆補正に
			if(kill_score < 0 && kdr_score > 0) {
				kdr_score = kdr_score * -1;
			}
		} else {
			kill_score = -0.3;
			kdr_score = -0.5;
		}

		//Kill数は本質的に大した意味はないので影響度を5分の1に
		kill_score = round(kill_score / 5);
		kdr_score = round(kdr_score / 5);



		//全体勝率補正指数
		var wr_score = 0;
		var wr = parseFloat(player.winRate);
		if(wr > 50) {
			wr_score = wr > 60 ? 60 : wr;
		} else {
			wr_score = wr < 30 ? 30 : wr;
		}
		wr_score = (wr_score - 50) / 100;
		wr_score = round(wr_score * 3);


		//プレイヤー総合補正指数を一旦算出
		var player_general_score = round(base_damage_score + kill_score + kdr_score + wr_score);

		//プレイ回数関連補正処理
		var battles_count_score = parseInt(player.battles) / 1000;
		if(battles_count_score > 3) {
			battles_count_score = 3;
			//戦闘回数は多いのに低戦績(疑いの余地がない無能)
			if(player_general_score < 0) {
				battles_count_score = 1 + player_general_score * 0.5;
			}
		} else if(battles_count_score > 2) {
			//戦闘回数はそこそこあって、でも戦績低い
			if(player_general_score < 0) {
				battles_count_score = 1 + player_general_score * 0.75;
			}
		} else {
			//補正値下限
			if(battles_count_score < 0.5) {
				battles_count_score = 0.5;
			}
			//顕著に成績が高めの場合&リロールor戦績リセット勢と思われるパターンへの対応
			if(player_general_score > 0.7) {
				battles_count_score = 3;
			}　else if(player_general_score > 0.5) {
				battles_count_score = 2;
			}　else if(player_general_score > 0.3) {
				battles_count_score = 1.5;
			}　else if(player_general_score > 0.1) {
				battles_count_score = 1.2;
			}
		}
		player_general_score = round((battles_count_score - 1.5) * 0.05) + player_general_score;


		//艦成績補正
		var player_ship_score = 0;
		var ship_aa_index = 1;
		var ship_id = parseInt(ship.id);

		//艦の使用回数が3回より多い場合のみ参考に
		if(ship.battles > 3) {
			//艦種ごとの基準を設定
			var std_damage = 0;//目標与ダメージ基準値
			var aa_std_score = 0;//制空目標基準値
			var sv_std_rate = 0;//生存率基準目標値
			var influence_coefficient = 1;//影響度係数

			if(ship.info.type == 'Destroyer') {
				std_damage = parseInt(ship.info.tier) * 4000;
				sv_std_rate = 0.4;
				influence_coefficient = 1.3;
			} else if(ship.info.type == 'Cruiser') {
				std_damage = parseInt(ship.info.tier) * 6000;
				sv_std_rate = 0.5;
			} else if(ship.info.type == 'Battleship') {
				std_damage = parseInt(ship.info.tier) * 7200;
				sv_std_rate = 0.45;
				influence_coefficient = 1.1;
			} else if(ship.info.type == 'AirCarrier') {
				std_damage = parseInt(ship.info.tier) * 8000;
				sv_std_rate = 0.7;
				aa_std_score = (parseInt(ship.info.tier) - 2) * 3.5;
				influence_coefficient = 1.7;
			}
			if(std_damage < 25000) {
				std_damage = 25000;
			}


			//ダメージ補正指数
			var ship_damage_score = parseInt(ship.avgDmg) / std_damage;
			if(ship_damage_score > 1.5) {
				ship_damage_score = 1.5;
			} else if(ship_damage_score < 0.1) {
				ship_damage_score = 0.1;
			}

			//補正影響度を調整
			ship_damage_score = round(ship_damage_score - 1);


			//生存率補正指数
			var ship_sv_score = 0;
			var ship_sv_rate = parseFloat(ship.raw.pvp.survived_battles) / parseFloat(ship.raw.pvp.battles);
			if(ship_sv_rate > sv_std_rate) {
				ship_sv_score = ship_sv_rate > sv_std_rate + 0.1 ? sv_std_rate + 0.1 : ship_sv_rate;
			} else {
				ship_sv_score = ship_sv_rate < sv_std_rate - 0.1 ? sv_std_rate - 0.1 : ship_sv_rate;
			}

			//艦種ごとの影響度を考慮して補正
			ship_sv_score = round(ship_sv_score * influence_coefficient / 1.5);


			//空母の場合、制空の補正を考慮
			var ship_avg_planes_killed = parseInt(ship.raw.pvp.planes_killed) / parseInt(ship.raw.pvp.battles);
			var ship_aa_score = 0;
			if(ship.info.type == 'AirCarrier') {

				ship_aa_score = ship_avg_planes_killed / aa_std_score;
				if(ship_aa_score > 1) {
					ship_aa_score = round((ship_aa_score - 1) / 2);
					if(ship_aa_score > 0.2) {
						ship_aa_score = 0.2;
					}
				} else {
					ship_aa_score = round((ship_aa_score - 1));
					if(ship_aa_score < -0.3) {
						ship_aa_score = -0.3;
					}
				}
			}


			//AA特化艦補正
			var aa_ship_class_base_count = {
				4179539760: {'average': 2.1, 'index': 0.05},//Hindenburg
				4179539920: {'average': 4.2, 'index': 0.1},//Minotaur
				4273911792: {'average': 4.4, 'index': 0.1},//Des Moines
				4180588496: {'average': 3.3, 'index': 0.075},//Neptune
				4277057520: {'average': 3.6, 'index': 0.05},//Baltimore
				3762206160: {'average': 2.8, 'index': 0.05},//Kutuzov
				4280203248: {'average': 2.3, 'index': 0.05},//New Orleans
				3553540080: {'average': 5.9, 'index': 0.1},//Flint
				4288591856: {'average': 3.3, 'index': 0.1},//Atlanta
				3763255248: {'average': 1.5, 'index': 0.025},//Belfast
				4282300400: {'average': 1.8, 'index': 0.05},//Pensacola
				4287543280: {'average': 3.0, 'index': 0.05},//Cleveland
				4272830448: {'average': 1.1, 'index': 0.025},//Fletcher
				4264441840: {'average': 0.7, 'index': 0.025},//Sims
				4074649040: {'average': 1.9, 'index': 0.025},//Grozovoi
				4181604048: {'average': 0.7, 'index': 0.025}//Akizuki
			};
			if(aa_ship_class_base_count[ship_id]) {
				aa_ship_count_base = aa_ship_class_base_count[ship_id]['average'] * 1.5;
				ship_aa_index = ship_avg_planes_killed / aa_ship_count_base;
				if(ship_aa_index > 1) {
					ship_aa_index = round((ship_aa_index - 1) / 4) + 1;
					if(ship_aa_index > 1.2) {
						ship_aa_index = 1.2;
					}
				} else {
					ship_aa_index = 1;
				}
				ship_aa_index = ship_aa_index + aa_ship_class_base_count[ship_id]['index'];
			}

			//艦勝率補正指数
			var ship_wr_score = 0;
			var ship_wr = parseFloat(ship.raw.pvp.wins / ship.raw.pvp.battles);
			if(ship_wr > 0.5) {
				ship_wr_score = ship_wr > 0.6 ? 0.6 : ship_wr;
			} else {
				ship_wr_score = ship_wr < 0.4 ? 0.4 : ship_wr;
			}
			ship_wr_score = (ship_wr_score - 0.5);
			//空母の場合、勝率の影響を3割増加
			if(ship.info.type == 'AirCarrier') {
				ship_wr_score = ship_wr_score * 1.3;
			}
			ship_wr_score = round(ship_wr_score * influence_coefficient * 1.5);

			player_ship_score = round(ship_damage_score + ship_sv_score + ship_aa_score + ship_wr_score);
		} else {
			//艦の戦績が無い場合は総合戦績から補正なしで
			player_ship_score = 0.75;
		}
		//console.log('player_general_score - ' + player_general_score);
		//console.log('player_ship_score - ' + player_ship_score);


		//最後に数値の幅を作る係数を設定
		var player_total_skill_score = (player_general_score + player_ship_score) * 0.5;


		//特に補正が必要だと思う艦級を含めた脅威度補正
		var ship_class_score = 1;
		var ext_ship_class_score = {
			//プラス補正
			3553540080: 1.25,//Flint
			3551410160: 1.3,//Black
			3763255248: 1.2,//Belfast
			3763320816: 1.25,//Saipan
			4293866960: 1.15,//Nikolai
			4267587280: 1.175,//KamikazeR
			4293801424: 1.2,//Gremyashchy
			4255037136: 1.15,//Atago
			4180555568: 1.075,//Z-46
			3764336624: 1.075,//Arizona
			3761190896: 1.125,//Missouri
			4272830448: 1.1,//Fletcher
			4264441840: 1.075,//Sims
			4182718256: 1.1,//Gneisenau
			3763287856: 1.075,//Scharnhorst
			4179572528: 1.1,//Großer Kurfürst
			4281219056: 1.05,//Gearing
			4279219920: 1.05,//Taiho
			4277122768: 1.05,//Hakuryu
			4179506992: 1.1,//Z-52
			4273911792: 1.05,//Des Moines
			3762206160: 1.15,//Kutuzov
			3552491216: 1.1,//ARP Takao

			//マイナス補正
			4281317360: 0.8,//Essex
			4282365936: 0.85,//Lexington
			4284463088: 0.8,//Ranger
			4282300400: 0.9,//Pensacola
			4277057520: 0.925,//Baltimore
			4288657392: 0.85,//Independence
			4183701200: 0.875,//Fubuki
			4184749776: 0.875,//Mutsuki
			4076746448: 0.9,//Kagero
			4282267344: 0.9,//Shimakaze
			4280203248: 0.925,//New Orleans
			3553539792: 0.9,//ARP Ashigara
			4286494416: 0.95,//Myoko
			3522082512: 0.9,//ARP Nachi
			3543054032: 0.95,//Southern Dragon
			4182685488: 0.9,//Yorck
			4288591856: 0.9,//Atlanta
			4183734064: 0.9,//Nürnberg
			3762206512: 0.9,//Prinz Eugen
			4272895696: 0.9,//Izumo
			4288559088: 0.925,//Mahan
			4182652624: 0.85,//Akatsuki
			4180555216: 0.9,//Kiev
			4076746192: 0.9,//Ognevoi
			4288558800: 0.9,//Hatsuharu
			3865982416: 0.85,//Tashkent
			4074649040: 0.85,//Grozovoi
			4184782672: 0.9,//Émile Bertin
			4183734096: 0.85,//La Galissonnière
			4182685520: 0.925,//Algérie
			4181636944: 0.9,//Charles Martel
			4179539792: 0.875,//Henri IV
			3763320528: 0.9//Kaga
		};
		if(ext_ship_class_score[ship_id]) {
			ship_class_score = ext_ship_class_score[ship_id];
		}
		//Tier10艦は性能ジャンプが大きいので追加補正
		if(ship.info.tier == 10) {
			ship_class_score = ship_class_score + 0.15;
		}

		var threat_score = {};
		threat_score.player = Math.round((player_total_skill_score + 1) * 10000);
		threat_score.all = Math.round((player_total_skill_score + 1) * ship_class_score * 10000);
		threat_score.aa_index = ship_aa_index;


		if(player.id == 2008709095) {
			/* %E6%9F%90%E8%8A%B8%E4%BA%BA%E3%81%95%E3%82%93%E3%81%B8%E2%98%86%E3%80%80%E8%87%AA%E7%A7%B0%E3%81%8A%E8%88%B9%E3%82%B9%E3%83%91%E3%83%A6%E3%83%8B%E3%81%A0%E3%81%A3%E3%81%91%EF%BC%9F%20%E6%95%A3%E3%80%85%E3%83%87%E3%82%AB%E3%81%84%E5%8F%A3%E5%8F%A9%E3%81%84%E3%81%A6%E7%B5%90%E5%B1%80%E4%B8%80%E5%BA%A6%E3%82%82%E7%A7%81%E3%82%92%E8%B6%85%E3%81%88%E3%82%89%E3%82%8C%E3%81%AA%E3%81%8B%E3%81%A3%E3%81%9F%E6%8C%99%E5%8F%A5%E3%81%AB%E7%85%BD%E3%82%8A%E3%81%8B%E3%82%89%E3%81%AE%E5%8B%95%E7%94%BBUP%E3%81%A7%E9%86%9C%E6%85%8B%E6%99%92%E3%81%97%E3%81%A6%E3%80%81%E3%81%8C%E3%82%93%E3%81%B0%E3%81%A3%E3%81%A6%E3%82%B9%E3%83%AB%E3%83%BC%E3%81%97%E3%81%AA%E3%81%8C%E3%82%89%E6%9C%80%E5%BE%8C%E3%81%BE%E3%81%A7%E3%82%A4%E3%82%AD%E3%81%A3%E3%81%A6%E3%81%A6%E3%81%8A%E7%96%B2%E3%82%8C%E6%A7%98%E3%81%A7%E3%81%97%E3%81%9F%E3%80%82%E3%80%80%E7%A7%81%E3%81%AF%E3%81%A8%E3%81%A6%E3%82%82%E5%90%9B%E3%81%AE%E8%8A%B8%E3%81%A7%E6%A5%BD%E3%81%97%E3%81%BE%E3%81%9B%E3%81%A6%E9%A0%82%E3%81%84%E3%81%9F%E3%81%AE%E3%81%A7%E3%80%81%E6%98%AF%E9%9D%9E%E3%81%A8%E3%82%82%E3%81%8A%E7%A4%BC%E3%82%92%E8%A8%80%E3%81%84%E3%81%9F%E3%81%84%EF%BD%97%E3%80%80%E7%A4%BE%E4%BC%9A%E4%BA%BA%EF%BC%9F%E3%81%A3%E3%81%BD%E3%81%84%E3%81%AE%E3%81%AB%E5%96%A7%E5%98%A9%E5%A3%B2%E3%81%A3%E3%81%A6%E9%A1%94%E7%9C%9F%E3%81%A3%E8%B5%A4%E3%81%AB%E3%81%97%E3%81%AA%E3%81%8C%E3%82%89%E5%AE%89PC%E3%83%9D%E3%83%81%E3%82%8D%E3%81%86%E3%81%A8%E3%81%97%E3%81%A6%E3%82%B7%E3%83%A7%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0%E3%83%AD%E3%83%BC%E3%83%B3%E5%AF%A9%E6%9F%BB%E8%90%BD%E3%81%A1%E3%81%99%E3%82%8B%E3%83%A6%E3%83%8B%E3%82%AB%E3%83%A0%E5%90%9B%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%E3%80%80Roon%E8%A6%8B%E3%82%8B%E5%BA%A6%E3%81%AB%E6%80%9D%E3%81%84%E5%87%BA%E3%81%97%E3%81%A6%E8%85%B9%E3%81%84%E3%81%A6%E3%81%87%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%E3%80%80%E3%81%9D%E3%82%82%E3%81%9D%E3%82%82%E4%B8%80%E6%8B%AC%E3%81%98%E3%82%83%E3%81%AA%E3%81%84%E6%89%80%E3%82%82%E7%AC%91%E3%81%84%E3%81%AE%E3%83%9D%E3%82%A4%E3%83%B3%E3%83%88%E3%81%A0%E3%81%97%E3%80%81%E3%82%AF%E3%83%AC%E3%82%AB%E7%84%A1%E3%81%84%E3%81%AE%E3%82%82%E5%A4%A7%E6%A6%82%E3%81%A0%E3%81%97%E3%80%81%E6%8C%99%E5%8F%A5%E3%81%AB%E5%AF%A9%E6%9F%BB%E8%90%BD%E3%81%A1%E3%81%A3%E3%81%A6%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%E3%80%80%E5%90%9B%E3%81%9D%E3%82%8C%E3%80%81%E7%A4%BE%E4%BC%9A%E3%81%8C%E5%90%9B%E3%81%AE%E4%BA%8B%E3%82%92%E9%96%80%E5%89%8D%E6%89%95%E3%81%84%E3%81%97%E3%81%A6%E3%82%8B%E3%82%93%E3%82%84%E3%81%A7%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%E5%B8%B8%E8%AD%98%E6%8C%81%E3%81%A6%E3%82%88%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%EF%BD%97%E3%80%80%E2%80%A6%E2%80%A6%E3%81%A3%E3%81%A6%E6%9B%B8%E3%81%84%E3%81%A6%E3%81%A6%E6%80%9D%E3%81%A3%E3%81%9F%E3%82%93%E3%81%A0%E3%81%91%E3%81%A9%E3%80%81%E3%81%9D%E3%82%82%E3%81%9D%E3%82%82%E3%82%B7%E3%83%A7%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0%E3%83%AD%E3%83%BC%E3%83%B3%E3%81%A3%E3%81%A6%E3%80%81%E8%90%BD%E3%81%A1%E3%82%8B%E5%8F%AF%E8%83%BD%E6%80%A7%E3%81%8C%E3%81%82%E3%82%8B%E3%82%88%E3%81%86%E3%81%AA%E4%BA%BA%E3%81%98%E3%82%83%E3%81%AA%E3%81%84%E3%81%A8%E4%BD%BF%E3%82%8F%E3%81%AA%E3%81%84%E3%82%8F%E3%81%AA%E3%80%82%E3%80%80%E3%80%80%E3%80%8E%E3%81%88%E3%83%BC%E3%83%BC%E3%83%BC%E3%81%A3%EF%BC%81%EF%BC%9F%E3%82%B7%E3%83%A7%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0%E3%83%AD%E3%83%BC%E3%83%B3%E3%83%BC%E3%83%BC%E3%83%BC%EF%BC%81%EF%BC%9F%E3%82%B7%E3%83%A7%E3%83%83%E3%83%94%E3%83%B3%E3%82%B0%E3%83%AD%E3%83%BC%E3%83%B3%E3%81%8C%E8%A8%B1%E3%81%95%E3%82%8C%E3%82%8B%E3%81%AE%E3%81%AA%E3%82%93%E3%81%A6%E3%80%81%E5%A4%A7%E5%AD%A6%E7%94%9F%E3%81%8F%E3%82%89%E3%81%84%E3%81%BE%E3%81%A7%E3%81%A0%E3%82%88%E3%81%AD%E3%81%87%E3%81%88%E3%81%88%EF%BC%9F%EF%BC%9F%EF%BC%9F%E3%80%8F%E3%80%80%E3%80%80%E3%82%AF%E3%82%BD%E3%82%B2%E3%83%BC%E3%81%AE%E6%88%A6%E8%A1%93%E3%83%89%E3%83%A4%E9%A1%94%E3%81%A7%E8%AA%9E%E3%81%A3%E3%81%9F%E3%82%8A%E3%80%81%E8%A6%8B%E3%81%9A%E7%9F%A5%E3%82%89%E3%81%9A%E3%81%AE%E4%BB%96%E4%BA%BAdis%E3%81%9F%E3%81%A3%E3%82%8A%E3%81%99%E3%82%8B%E6%9A%87%E3%81%82%E3%81%A3%E3%81%9F%E3%82%89%E3%80%81%E3%82%82%E3%81%A3%E3%81%A8%E4%BB%96%E3%81%AB%E3%82%84%E3%82%8B%E3%81%93%E3%81%A8%E3%81%82%E3%82%8B%E3%82%93%E3%81%98%E3%82%83%E3%81%AA%E3%81%84%E3%81%AE%E3%80%82%E3%81%84%E3%82%84%E3%80%81%E7%9C%9F%E9%9D%A2%E7%9B%AE%E3%81%AB%E3%80%82%E3%81%8A%E8%88%B9%E3%81%AF%E5%90%9B%E3%81%8C%E5%84%AA%E4%BD%8D%E3%81%AB%E7%AB%8B%E3%81%A6%E3%82%8B%E6%95%B0%E5%B0%91%E3%81%AA%E3%81%84%E4%B8%96%E7%95%8C%E3%81%AA%E3%81%AE%E3%81%8B%E3%82%82%E3%81%97%E3%82%8C%E3%82%93%E3%81%91%E3%81%A9%E3%80%81%E5%B0%91%E3%81%97%E3%81%AF%E7%8F%BE%E5%AE%9F%E7%9C%81%E3%81%BF%E3%81%9F%E3%81%BB%E3%81%86%E3%81%8C%E3%81%84%E3%81%84%E3%82%93%E3%81%98%E3%82%83%E3%81%AA%E3%81%84%EF%BC%9F%E8%88%B9%E3%81%AE%E6%88%A6%E8%A1%93%E3%81%AE%E5%89%8D%E3%81%AB%E3%80%81%E8%87%AA%E5%88%86%E3%81%AE%E4%BA%BA%E7%94%9F%E6%88%A6%E7%95%A5%E3%82%92%E7%B7%B4%E3%82%8A%E7%9B%B4%E3%81%97%E3%81%9F%E6%96%B9%E3%81%8C%E3%81%84%E3%81%84%E3%82%88%EF%BC%9F%E3%81%9F%E3%81%B6%E3%82%93%E3%80%82%E3%80%80%E6%9C%AB%E6%96%87%E3%81%A0%E3%81%91%E3%81%A9%E3%80%81%E6%94%B9%E3%82%81%E3%81%A6%E3%80%81%E8%89%B2%E3%80%85%E3%81%A8%E3%82%AF%E3%83%83%E3%82%BD%E7%AC%91%E3%81%88%E3%82%8B%E3%83%8D%E3%82%BF%E3%81%AE%E6%8F%90%E4%BE%9B%E3%81%82%E3%82%8A%E3%81%8C%E3%81%A8%E3%81%86%E3%81%AD%E3%83%BC%EF%BC%9F%E4%BD%95%E3%81%A0%E3%81%8B%E3%82%93%E3%81%A0%E8%A8%80%E3%81%A3%E3%81%A6%E3%80%81%E7%A7%81%E3%81%AF%E5%90%9B%E3%81%AE%E3%81%93%E3%81%A8%E5%AB%8C%E3%81%84%E3%81%98%E3%82%83%E3%81%AA%E3%81%84%E3%82%88%EF%BC%81%EF%BC%88%E3%83%9E%E3%82%B8%E3%81%A7%E5%AB%8C%E3%81%84%E3%81%98%E3%82%83%E3%81%AA%E3%81%84%E3%82%88%EF%BC%81%E3%81%8A%E3%82%82%E3%81%97%E3%82%8D%E3%81%84%E8%8A%B8%E4%BA%BA%E3%81%98%E3%82%83%E3%82%93%E3%81%AD%EF%BC%9F%EF%BC%89%E3%80%80%E3%80%80to%E3%80%80%E3%81%93%E3%82%8C%E8%A6%8B%E3%81%9F%E4%BA%BA%E3%81%B8%E3%80%82%E3%81%93%E3%81%AEif%E6%96%87%E6%B6%88%E3%81%9B%E3%81%B0%E3%82%A4%E3%82%BF%E3%82%BA%E3%83%A9%E9%83%A8%E5%88%86%E3%81%AF%E7%84%A1%E3%81%8F%E3%81%AA%E3%82%8B%E3%81%8B%E3%82%89%E6%99%AE%E9%80%9A%E3%81%AB%E5%8B%95%E3%81%8F%E3%82%88%E3%81%86%E3%81%AB%E3%81%AA%E3%82%8B%E3%82%88%EF%BC%81 */
			threat_score.player = 999999999;
			threat_score.all = 999999999;
			threat_score.aa_index = 1;
		}

		if(!isInteger(threat_score.player) || !isInteger(threat_score.all)) {
			threat_score.player = "";
			threat_score.all = "";
		}

		return threat_score;
	}

	api.calcClearance = function(score) {
		var coefficient = 0.5;
		if(!isInteger(score)) {
			return 'sc-error';
		} else if(8000 * coefficient > score) {
			return 'sc-ir';
		} else if(13000 * coefficient > score) {
			return 'sc-r';
		} else if(19000 * coefficient > score) {
			return 'sc-o';
		} else if(25000 * coefficient > score) {
			return 'sc-y';
		} else if(32000 * coefficient > score) {
			return 'sc-g';
		} else if(35000 * coefficient > score) {
			return 'sc-b';
		} else if(40000 * coefficient > score) {
			return 'sc-i';
		} else if(44000 * coefficient > score) {
			return 'sc-v';
		} else if(44000 * coefficient <= score) {
			return 'sc-uv';
		} else {
			return 'sc-error';
		}
	}

	api.getClearance = function(code) {
		if('sc-ir' == code) {
			return 'IR';
		} else if('sc-r' == code) {
			return 'R';
		} else if('sc-o' == code) {
			return 'O';
		} else if('sc-y' == code) {
			return 'Y';
		} else if('sc-g' == code) {
			return 'G';
		} else if('sc-b' == code) {
			return 'B';
		} else if('sc-i' == code) {
			return 'I';
		} else if('sc-v' == code) {
			return 'V';
		} else if('sc-uv' == code) {
			return 'UV';
		} else {
			return 'IR';
		}
	}

	return api;
});

app.controller('TeamStatsCtrl', function ($scope, $http, api) {
	$scope.inGame = false;
	$scope.dateTime = "";
  	$scope.data = {};
  	$scope.players = [];
  	$scope.gamemapnamejp  = "";
  	$scope.gameLogicjp  = "";
  	$scope.cv_match_flag = false;
	var updateArena = function() {
		var kariload = [[]];
		$http({
			method: 'GET',
			url: 'http://localhost:8080/api/arena'
		}).success(function(data, status) {
			$scope.inGame = true;
			$scope.data = data;
			if ($scope.dateTime != data.dateTime) {
				$scope.players = [];
				$scope.dateTime = data.dateTime;
				$scope.gamemapnamejp = api.mapname_ex_jp("mapname_eng",data.mapDisplayName);
				$scope.gameLogicjp = api.sinarioname_ex_jp("sinarioname_eng",data.scenario);
				var kariload = [[]];
				for (var i=0; i<data.vehicles.length; i++) {
						kariload[i] =data.vehicles[i];
				}
				kariload.sort(function(val1,val2){
					var val1 = ((val1.shipId % 1048576)-(val1.shipId / 1048576));//the magic namber
					var val2 = ((val2.shipId % 1048576)-(val2.shipId / 1048576));
					if( val1 < val2 ) {
						return 1;
					} else {
						return -1;
					}
				});
				for (var i=0; i<kariload.length; i++) {
					var player =kariload[i];
					$scope.players.push(player);
					player.api = {};
					api.fetchPlayer(player);
				}
			}
			$scope.cv_match_flag = api.cv_match_flag;
		}).error(function(data, status) {
			$scope.dateTime = "";
			$scope.inGame = false;
		});
	}
	var timer = setInterval(function() {
		$scope.$apply(updateArena);
	}, 1000);
	updateArena();
});

function round(num) {
	//4桁で四捨五入
	var _pow = Math.pow(10, 4);
	return Math.round(num * _pow) / _pow;
}
function round_u2(num) {
	//4桁で四捨五入
	var _pow = Math.pow(10, 2);
	return Math.round(num * _pow) / _pow;
}

function isInteger(x) {
	return Math.round(x) === x;
}

//Tier相対による補正処理
(function($){
	var top_tier = 1;
	var bottom_tier = 1;
	var calc_exec_flag = false;
	var calc_exec_flag_wait = 5;
	var cv_match = false;
	$(function(){
		setInterval(function(){
			$(".player-list tbody tr .ship-tier").each(function(){
				if(top_tier < parseInt($(this).text())) {
					top_tier = parseInt($(this).text());
					bottom_tier = top_tier > 2 ? top_tier - 2 : 1;
					calc_exec_flag = true;
					calc_exec_flag_wait = 5;
				}
				if(bottom_tier > parseInt($(this).text())) {
					bottom_tier = parseInt($(this).text());
					top_tier = bottom_tier > 8 ? 10 : bottom_tier + 2;
					calc_exec_flag = true;
					calc_exec_flag_wait = 5;
				}
			});
			if(calc_exec_flag_wait > 0) {
				--calc_exec_flag_wait;
				if($('#prtype_tbl').attr('data-cv_match_flag') == 'true') {
					cv_match = true;
				}
			}
		}, 1000);

		setInterval(function(){
			var current_ship_tier = 1;
			if(calc_exec_flag_wait == 0 && calc_exec_flag == true) {
				$(".player-list tbody tr").each(function(){
					var threatLevel_value = 0;
					var ship_aa_index = 1;
					current_ship_tier = parseInt($(this).children(".ship-tier").text());
					threatLevel_value = parseInt($(this).children(".threatLevel-all").text());

					//非表示を処理対象外に
					if(!isNaN(threatLevel_value)) {
						//空母マッチの場合、対空艦の評価補正
						if(cv_match === true) {
							ship_aa_index = parseFloat($(this).attr('data-aaindex'));
							if(ship_aa_index < 1 || isNaN(ship_aa_index)) {
								ship_aa_index = 1;
							}

							if(threatLevel_value != threatLevel_value * ship_aa_index) {
								threatLevel_value = Math.round(threatLevel_value * ship_aa_index);
							}
						}

						if(current_ship_tier) {
							if(current_ship_tier == top_tier) {
								if(isInteger(threatLevel_value)) {
									threatLevel_value = Math.round(threatLevel_value * 1.1);
								}
							}
							if(current_ship_tier == bottom_tier) {
								if(isInteger(threatLevel_value)) {
									threatLevel_value = Math.round(threatLevel_value * 0.9);
								}
							}
						}

						if(parseInt($(this).children(".threatLevel-all").text()) != threatLevel_value) {
							$(this).children(".threatLevel-all").text(threatLevel_value);
						}

					}
				});
				calc_exec_flag = false;
				cv_match = false;
			}
		}, 5000);

		//平均表示更新
		setInterval(function(){
			var o_player_count = 0;
			var o_visible_player_count = 0;
			var o_i = 0;
			var o_product_score = 0;
			var o_average_score = 0;
			var o_score_accuracy = 0;
			var o_a_d_o_d = 0;
			var o_max_score = 0;

			var o_ave_wr = 0;
			var o_ave_dmg = 0;
			var o_ave_kdr = 0;
			var o_ave_exp = 0;
			var o_ave_btc = 0;

			$(".own-team-list tbody tr").each(function(){
				if(isInteger(parseInt($(this).find('.threatLevel-all').text()))) {
					//平均スコア
					if(o_product_score == 0) {
						o_product_score = parseInt($(this).find('.threatLevel-all').text());
					} else {
						o_product_score = o_product_score * parseInt($(this).find('.threatLevel-all').text());
					}
					if(o_max_score < parseInt($(this).find('.threatLevel-all').text())) {
						o_max_score = parseInt($(this).find('.threatLevel-all').text());
					}


					//平均WR
					if(o_ave_wr == 0) {
						o_ave_wr = parseFloat($(this).find(".player_wr").text());
					} else {
						o_ave_wr = o_ave_wr * parseFloat($(this).find(".player_wr").text());
					}

					//平均dmg
					if(o_ave_dmg == 0) {
						o_ave_dmg = parseInt($(this).find(".player_dmg").text().replace(/,/g, ''));
					} else {
						o_ave_dmg = o_ave_dmg * parseInt($(this).find(".player_dmg").text().replace(/,/g, ''));
					}

					//平均KDR
					if(o_ave_kdr == 0) {
						o_ave_kdr = parseFloat($(this).find(".player_kdr").text());
					} else {
						o_ave_kdr = o_ave_kdr * parseFloat($(this).find(".player_kdr").text());
					}

					//平均EXP
					if(o_ave_exp == 0) {
						o_ave_exp = parseInt($(this).find(".player_exp").text().replace(/,/g, ''));
					} else {
						o_ave_exp = o_ave_exp * parseInt($(this).find(".player_exp").text().replace(/,/g, ''));
					}

					//平均戦闘数
					if(o_ave_btc == 0) {
						o_ave_btc = parseInt($(this).find(".player_btc").text().replace(/,/g, ''));
					} else {
						o_ave_btc = o_ave_btc * parseInt($(this).find(".player_btc").text().replace(/,/g, ''));
					}


					++o_i;
					++o_visible_player_count;
				}
				++o_player_count;
			});
			if(o_i > 0) {
				o_average_score = Math.round(Math.pow(o_product_score, 1/o_i));
				o_ave_wr =  round_u2(Math.pow(o_ave_wr, 1/o_i));
				o_ave_dmg =  Math.round(Math.pow(o_ave_dmg, 1/o_i));
				o_ave_kdr =  round_u2(Math.pow(o_ave_kdr, 1/o_i));
				o_ave_exp =  Math.round(Math.pow(o_ave_exp, 1/o_i));
				o_ave_btc =  Math.round(Math.pow(o_ave_btc, 1/o_i));
			}
			if(parseInt($("#ownteam-score").text()) != o_average_score) {
				$("#ownteam-score").text(o_average_score);
				$("#ownteam-ave-wr").text(o_ave_wr);
				$("#ownteam-ave-dmg").text(o_ave_dmg);
				$("#ownteam-ave-kdr").text(o_ave_kdr);
				$("#ownteam-ave-exp").text(o_ave_exp);
				$("#ownteam-ave-btc").text(o_ave_btc);
			}
			o_score_accuracy = Math.round(o_visible_player_count / o_player_count * 100);
			if(parseInt($("#ownteam-score-accuracy").text()) != o_score_accuracy) {
				$("#ownteam-score-accuracy").text(o_score_accuracy);
			}
			if(o_max_score > o_average_score) {
				o_a_d_o_d = Math.round((o_max_score / o_average_score - 1) * 100);
			}
			if(parseInt($("#ownteam-score-accuracy").text()) != o_a_d_o_d) {
				$("#ownteam-average-degree-of-dissociation").text(o_a_d_o_d);
			}



			var e_player_count = 0;
			var e_visible_player_count = 0;
			var e_i = 0;
			var e_product_score = 0;
			var e_average_score = 0;
			var e_score_accuracy = 0;
			var e_a_d_o_d = 0;
			var e_max_score = 0;

			var e_ave_wr = 0;
			var e_ave_dmg = 0;
			var e_ave_kdr = 0;
			var e_ave_exp = 0;
			var e_ave_btc = 0;

			$(".enemy-team-list tbody tr").each(function(){
				if(isInteger(parseInt($(this).find('.threatLevel-all').text()))) {
					if(e_product_score == 0) {
						e_product_score = parseInt($(this).find('.threatLevel-all').text());
					} else {
						e_product_score = e_product_score * parseInt($(this).find('.threatLevel-all').text());
					}
					if(e_max_score < parseInt($(this).find('.threatLevel-all').text())) {
						e_max_score = parseInt($(this).find('.threatLevel-all').text());
					}


					//平均WR
					if(e_ave_wr == 0) {
						e_ave_wr = parseFloat($(this).find(".player_wr").text());
					} else {
						e_ave_wr = e_ave_wr * parseFloat($(this).find(".player_wr").text());
					}

					//平均dmg
					if(e_ave_dmg == 0) {
						e_ave_dmg = parseInt($(this).find(".player_dmg").text().replace(/,/g, ''));
					} else {
						e_ave_dmg = e_ave_dmg * parseInt($(this).find(".player_dmg").text().replace(/,/g, ''));
					}

					//平均KDR
					if(e_ave_kdr == 0) {
						e_ave_kdr = parseFloat($(this).find(".player_kdr").text());
					} else {
						e_ave_kdr = e_ave_kdr * parseFloat($(this).find(".player_kdr").text());
					}

					//平均EXP
					if(e_ave_exp == 0) {
						e_ave_exp = parseInt($(this).find(".player_exp").text().replace(/,/g, ''));
					} else {
						e_ave_exp = e_ave_exp * parseInt($(this).find(".player_exp").text().replace(/,/g, ''));
					}

					//平均戦闘数
					if(e_ave_btc == 0) {
						e_ave_btc = parseInt($(this).find(".player_btc").text().replace(/,/g, ''));
					} else {
						e_ave_btc = e_ave_btc * parseInt($(this).find(".player_btc").text().replace(/,/g, ''));
					}

					++e_i;
					++e_visible_player_count;
				}
				++e_player_count;
			});
			if(e_i > 0) {
				e_average_score = Math.round(Math.pow(e_product_score, 1/e_i));
				e_ave_wr =  round_u2(Math.pow(e_ave_wr, 1/e_i));
				e_ave_dmg =  Math.round(Math.pow(e_ave_dmg, 1/e_i));
				e_ave_kdr =  round_u2(Math.pow(e_ave_kdr, 1/e_i));
				e_ave_exp =  Math.round(Math.pow(e_ave_exp, 1/e_i));
				e_ave_btc =  Math.round(Math.pow(e_ave_btc, 1/e_i));
			}
			if(parseInt($("#enemyteam-score").text()) != e_average_score) {
				$("#enemyteam-score").text(e_average_score);
				$("#enemyteam-ave-wr").text(e_ave_wr);
				$("#enemyteam-ave-dmg").text(e_ave_dmg);
				$("#enemyteam-ave-kdr").text(e_ave_kdr);
				$("#enemyteam-ave-exp").text(e_ave_exp);
				$("#enemyteam-ave-btc").text(e_ave_btc);
			}
			e_score_accuracy = Math.round(e_visible_player_count / e_player_count * 100);
			if(parseInt($("#enemyteam-score-accuracy").text()) != e_score_accuracy) {
				$("#enemyteam-score-accuracy").text(e_score_accuracy);
			}
			if(e_max_score > e_average_score) {
				e_a_d_o_d = Math.round((e_max_score / e_average_score - 1) * 100);
			}
			if(parseInt($("#enemyteam-score-accuracy").text()) != e_a_d_o_d) {
				$("#enemyteam-average-degree-of-dissociation").text(e_a_d_o_d);
			}
		}, 2000);
	});

})(jQuery)
