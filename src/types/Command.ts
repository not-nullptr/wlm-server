export enum Locale {
	Afrikaans_South_Africa = 1078,
	Albanian_Albania = 1052,
	Arabic_Algeria = 5121,
	Arabic_Bahrain = 15361,
	Arabic_Egypt = 3073,
	Arabic_Iraq = 2049,
	Arabic_Jordan = 11265,
	Arabic_Kuwait = 13313,
	Arabic_Lebanon = 12289,
	Arabic_Libya = 4097,
	Arabic_Morocco = 6145,
	Arabic_Oman = 8193,
	Arabic_Qatar = 16385,
	Arabic_Saudi_Arabia = 1025,
	Arabic_Syria = 10241,
	Arabic_Tunisia = 7169,
	Arabic_UAE = 14337,
	Arabic_Yemen = 9217,
	Armenian_Armenia = 1067,
	Azeri_Cyrillic_Azerbaijan = 2092,
	Azeri_Latin_Azerbaijan = 1068,
	Basque_Spain = 1069,
	Belarusian_Belarus = 1059,
	Bulgarian_Bulgaria = 1026,
	Catalan_Spain = 1027,
	Chinese_Hong_Kong = 3076,
	Chinese_Macau = 5124,
	Chinese_PRC = 2052,
	Chinese_Singapore = 4100,
	Chinese_Taiwan = 1028,
	Croatian_Croatia = 1050,
	Czech_Czech_Republic = 1029,
	Danish_Denmark = 1030,
	Divehi_Maldives = 1125,
	Dutch_Belgium = 2067,
	Dutch_Netherlands = 1043,
	English_Australia = 3081,
	English_Belize = 10249,
	English_Canada = 4105,
	English_Caribbean = 9225,
	English_Ireland = 6153,
	English_Jamaica = 8201,
	English_New_Zealand = 5129,
	English_Philippines = 13321,
	English_South_Africa = 7177,
	English_Trinidad_and_Tobago = 11273,
	English_United_Kingdom = 2057,
	English_United_States = 1033,
	English_Zimbabwe = 12297,
	Estonian_Estonia = 1061,
	Faroese_Faeroe_Islands = 1080,
	Farsi_Iran = 1065,
	Finnish_Finland = 1035,
	French_Belgium = 2060,
	French_Canada = 3084,
	French_France = 1036,
	French_Luxembourg = 5132,
	French_Monaco = 6156,
	French_Switzerland = 4108,
	FYRO_Macedonian_Macedonia = 1071,
	Galician_Spain = 1110,
	Georgian_Georgia = 1079,
	German_Austria = 3079,
	German_Germany = 1031,
	German_Liechtenstein = 5127,
	German_Luxembourg = 4103,
	German_Switzerland = 2055,
	Greek_Greece = 1032,
	Gujarati_India = 1095,
	Hebrew_Israel = 1037,
	Hindi_India = 1081,
	Hungarian_Hungary = 1038,
	Icelandic_Iceland = 1039,
	Indonesian_Indonesia = 1057,
	Italian_Italy = 1040,
	Italian_Switzerland = 2064,
	Japanese_Japan = 1041,
	Kannada_India = 1099,
	Kazakh_Kazakhstan = 1087,
	Konkani_India = 1111,
	Korean_Korea = 1042,
	Kyrgyz_Kyrgyzstan = 1088,
	Latvian_Latvia = 1062,
	Lithuanian_Lithuania = 1063,
	Malay_Brunei_Darussalam = 2110,
	Malay_Malaysia = 1086,
	Marathi_India = 1102,
	Mongolian_Mongolia = 1104,
	Norwegian_Bokmal_Norway = 1044,
	Norwegian_Nynorsk_Norway = 2068,
	Polish_Poland = 1045,
	Portuguese_Brazil = 1046,
	Portuguese_Portugal = 2070,
	Punjabi_India = 1094,
	Romanian_Romania = 1048,
	Russian_Russia = 1049,
	Sanskrit_India = 1103,
	Serbian_Cyrillic_Serbia_and_Montenegro = 3098,
	Serbian_Latin_Serbia_and_Montenegro = 2074,
	Slovak_Slovakia = 1051,
	Slovenian_Slovenia = 1060,
	Spanish_Argentina = 11274,
	Spanish_Bolivia = 16394,
	Spanish_Chile = 13322,
	Spanish_Colombia = 9226,
	Spanish_Costa_Rica = 5130,
	Spanish_Dominican_Republic = 7178,
	Spanish_Ecuador = 12298,
	Spanish_El_Salvador = 17418,
	Spanish_Guatemala = 4106,
	Spanish_Honduras = 18442,
	Spanish_Mexico = 2058,
	Spanish_Nicaragua = 19466,
	Spanish_Panama = 6154,
	Spanish_Paraguay = 15370,
	Spanish_Peru = 10250,
	Spanish_Puerto_Rico = 20490,
	Spanish_Spain = 1034,
	Spanish_Uruguay = 14346,
	Spanish_Venezuela = 8202,
	Spanish_Modern_Sort_Spain = 3082,
	Swahili_Kenya = 1089,
	Swedish_Finland = 2077,
	Swedish_Sweden = 1053,
	Syriac_Syria = 1114,
	Tamil_India = 1097,
	Tatar_Tatarstan = 1092,
	Telugu_India = 1098,
	Thai_Thailand = 1054,
	Turkish_Turkey = 1055,
	Ukrainian_Ukraine = 1058,
	Urdu_Pakistan = 1056,
	Uzbek_Cyrillic_Uzbekistan = 2115,
	Uzbek_Latin_Uzbekistan = 1091,
	Vietnamese_Vietnam = 1066,
	Welsh_United_Kingdom = 1106,
}

export enum Command {
	ADL = "ADL",
	VER = "VER",
	CVR = "CVR",
	INF = "INF",
	USR = "USR",
	XFR = "XFR",
}

export enum Protocol {
	MSNP18 = "MSNP18",
	MSNP17 = "MSNP17",
	CVR0 = "CVR0",
}

export interface BaseCommand {
	type: Command;
	trid?: number;
}

export interface VerCommand extends BaseCommand {
	type: Command.VER;
	supportedProtocols: Protocol[];
}

export interface CvrCommand extends BaseCommand {
	type: Command.CVR;
	/**
	 * The Protocols/MSNP/Locale ID of the client, represented as a hexadecimal number.
	 * @example "0x0409" for English (United States)
	 */
	localeId: Locale;

	/**
	 * Operating system family of the client.
	 * @example "win" for Windows 9x, "winnt" for Windows NT, 2K, XP, Vista, etc.
	 */
	osType: string;

	/**
	 * Major and Minor version numbers of the client's OS.
	 * @example "4.10" for Windows 98, "5.1" for Windows XP.
	 */
	osVer: number;

	/**
	 * Client hardware platform.
	 * @example "i386" for x86.
	 */
	arch: string;

	/**
	 * Name of your client's MSNP library.
	 * - "MSMSGS" (<5.0)
	 * - "MSGSTRST" (Messenger 2.2 under certain circumstances)
	 * - "MSMSGSMARS" (WM4.0)
	 * - "MSNMSGR" (Current official client)
	 */
	libraryName: string;

	/**
	 * Version of your client, represented as a 3-tuple.
	 * @example "6.0.0602"
	 */
	clientVer: string;

	/**
	 * Name of the client software. Note that both MSN Messenger 4.x and
	 * Windows Messenger 4.x used the same MSNP library, hence why they
	 * both sent "MSMSGS" as the libraryName parameter.
	 * @example "MSMSGS" (MSN Messenger), "WindowsMessenger" (Windows Messenger)
	 */
	clientName: string;

	/**
	 * The user's userHandle/passport email address.
	 * This parameter was added in MSNP8.
	 * @example someone@example.com
	 */
	passport: string;
}

export interface UsrCommand extends BaseCommand {
	type: Command.USR;
	TWN: "TWN";
	state: UsrState;
	passport?: string;
	t?: string;
	p?: string;
	machineGuid?: string;
}

export interface ADLCommand extends BaseCommand {
	type: Command.ADL;
}
// 	domain: string;
// 	emailBeginning: string;
// 	displayName: string;
// }

export type ICommand = VerCommand | CvrCommand | UsrCommand | ADLCommand;

export type SendFunction = (command: Command, ...args: string[]) => void;

export enum UsrState {
	/**
	 * The authentication is initial.
	 */
	Initial = "I",
	/**
	 * The authentication is subsequent.
	 */
	Subsequent = "S",
	/**
	 * The authentication is finished.
	 */
	OK = "OK",
}
