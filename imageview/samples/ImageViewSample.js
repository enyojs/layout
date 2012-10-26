enyo.kind({
	name: "enyo.sample.ImageViewSample",
	components: [
		{name:"sampleImageView", kind:"ImageView", src:"assets/globe.jpg", scale:"auto", classes:"enyo-fit", components: [
			{anchor: {top:79, right:224}, position: {bottom:0, left:-16}, components: [
				{kind:"Image", src:"assets/pin.png"}
			]},
			{anchor: {top:280, left:415}, position: {bottom:0, right:-16}, components: [
				{kind:"Image", src:"assets/pin.png"}
			]},
			{anchor: {bottom:80, left:400}, position: {bottom:0, left:0}, components: [
				{style:"background:rgba(255,255,255,0.8);border:1px solid #888;margin:0px;padding:0px;width:300px", components: [
					{tag:"h3", content:"This is a text box"}
				]}
			]},
			{anchor: {right:10, top:10}, position: {top:0, right:0}, components: [
				{style:"border:1px solid yellow;width:10px;height:10px;"}
			]}
		]}
	]
});

