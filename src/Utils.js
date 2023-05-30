
function ShuffleArray(array)
{
	for (let i = array.length - 1; i > 0; i--)
	{
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

function RandomInt(maximo)
{
	return Math.floor(Math.random() * (maximo + 1));
}

export {ShuffleArray, RandomInt}
