/**
 * Get type of room from it's name.
 *
 * @author engineeryo
 */
Room.getType = function (roomName) {
	const res = /[EW](\d+)[NS](\d+)/.exec(roomName);
	const [, EW, NS] = res;
	const EWI = EW % 10, NSI = NS % 10;
	if (EWI === 0 || NSI === 0) {
		return 'Highway';
	} else if (EWI === 5 && NSI === 5) {
		return 'Center';
	} else if (Math.abs(5 - EWI) <= 1 && Math.abs(5 - NSI) <= 1) {
		return 'SourceKeeper';
	} else {
		return 'Room';
	}
};