
////////////////////////////////////////////////////////////////////////////////
// Video playback related logic
////////////////////////////////////////////////////////////////////////////////

// Be aware that eventVideoDone will be triggered for each video
// and will be received by the mission script's eventVideoDone, should it exist.

//;; ## camPlayVideos(obj)
//;;
//;; Formats for parameter obj: {video: "video string", type: MISS_MSG/CAMP_MSG, immediate: true/false} OR
//;; ["sound file", {video: "video string", type: MISS_MSG/CAMP_MSG, immediate: true/false}, ...]
//;; object property "immediate" is optional since most videos are immediate.
//;; If videos is an array, queue up all of them for immediate playing. This
//;; function will play one video sequence should one be provided. Also,
//;; should a sound file be in a string (pcvX.ogg)  __camEnqueueVideos() will recognize it
//;; as a sound to play before a video. Of which is only supported when parameter obj is an array.
//;;
function camPlayVideos(obj)
{
	if (obj instanceof Array)
	{
		__camVideoSequences = obj;
		__camEnqueueVideos();
	}
	else if (obj instanceof Object)
	{
		if (!camDef(obj.video) || !camIsString(obj.video))
		{
			camDebug("Problem with video property.");
			return;
		}
		if (!camDef(obj.type) || (obj.type !== MISS_MSG && obj.type !== CAMP_MSG))
		{
			camDebug("Video message type was NOT specified. Please specify one.")
			return;
		}
		if (!camDef(obj.immediate))
		{
			obj.immediate = true;
		}
		hackAddMessage(obj.video, obj.type, CAM_HUMAN_PLAYER, obj.immediate);
	}
	else
	{
		camDebug("Funky camPlayVideos() parameter!");
	}
}

//////////// privates

// Play all stored videos and sounds one after the other.
// cam_eventVideoDone will call this function repeatedly.
function __camEnqueueVideos()
{
	if (__camVideoSequences.length === 0)
	{
		return; //Nothing to play
	}

	const SOUND_IDENTIFER = ".ogg";
	var what = __camVideoSequences[0];

	// Check if this is a sound to play before some sequence.
	if (typeof what === "string" && what.indexOf(SOUND_IDENTIFER) !== -1)
	{
		playSound(what);
		queue("__camEnqueueVideos", camSecondsToMilliseconds(3.2)); //more than enough for most sounds.
	}
	else if (typeof what === "object")
	{
		var play = true;

		if (!camDef(what.video) || !camIsString(what.video))
		{
			camDebug("Problem with video property.");
			play = false;
		}
		if (!camDef(what.type) || (what.type !== MISS_MSG && what.type !== CAMP_MSG))
		{
			camDebug("Video message type was NOT specified. Please specify one.")
			play = false;
		}
		if (!camDef(what.immediate))
		{
			what.immediate = true;
		}

		if (play)
		{
			hackAddMessage(what.video, what.type, CAM_HUMAN_PLAYER, what.immediate);
		}
	}
	else
	{
		camDebug("Funky camPlayVideos() parameter!");
	}

	__camVideoSequences.shift();
}
