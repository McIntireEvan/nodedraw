var colorWheel = new ColorWheel('wheel', 300);
colorWheel.setColorHex(color1);
$('#wheel').insertBefore('#color1');
$("#color1").css({background: color1});
$("#color2").css({background: color2});

$('#wheel').on('mousemove', function() {
	currTool.color = "#"+colorWheel.getHex();
    $('#hexValue').val("#"+colorWheel.getHex());
	if(activeColor == 1) {
        $("#color1").css({background: currTool.color});
        color1 = currTool.color;
	} else {
		$("#color2").css({background: currTool.color});
        color2 = currTool.color;
	}
});

$('#hexValue').on('keypress', function(e) {
    var char = String.fromCharCode(e.which);
    if(!char.match(/([a-f]|[0-9])+/ig)) {
        e.preventDefault();
        return false;
    }

    if($(this).val().replace('#', '').length == 6) {
        e.preventDefault();
        return false;
    }
})

$('#hexValue').on('blur', function() {
    var str = $(this).val().replace('#','');
    if(!str.match(/([a-f]|[0-9])+$/ig)) {
        $(this).val(currTool.color);
    }

    if(str.length != 6) {
        $(this).val(currTool.color);
    }

    colorWheel.setColorHex('#' + str);
    currTool.color = '#' + str;
    if(activeColor == 1) {
        $("#color1").css({background: currTool.color});
        color1 = currTool.color;
	} else {
		$("#color2").css({background: currTool.color});
        color2 = currTool.color;
	}
});

$("#color1").on('click', function() {
	activeColor = 1;
	currTool.color = color1;
	colorWheel.setColorHex(color1);
    $('#hexValue').val("#"+colorWheel.getHex());
});

$("#color2").on('click', function() {
	activeColor = 2;
	currTool.color = color2;
	colorWheel.setColorHex(color2);
    $('#hexValue').val("#"+colorWheel.getHex());
});

$('#savePalette').on('click', savePalette);

function savePalette() {
    var data = {};
    $('.color').each(function(i, obj) {
        //Turns out, the ctx treats color as hex, so setting the style to the rgb() we get converts it
        var rgb = $(obj).css('background-color');
        layers[currentLayer].ctx.strokeStyle = rgb;
        data[i] = layers[currentLayer].ctx.strokeStyle;
    });

    var blob = new Blob([JSON.stringify(data)], {type:"application/json"});

    var url = URL.createObjectURL(blob);

    var a = document.createElement('a');
    a.download = "palette.json";
    a.href = url;
    a.click();
}

$('#loadPalette').on('change', loadPalette);

function loadPalette() {
    if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('Sorry, your browser can\'t read this file');
        return;
    }

    var file = $('#loadPalette').get(0).files[0];
    var reader = new FileReader();
    reader.onload = function() {
        var json = JSON.parse(reader.result);
        console.log(json);
        for(var key in json) {
            addPaletteItem(json[key]);
        }
    }
    reader.readAsText(file);
}
var lClick;
function addPaletteItem(color) {
    var paletteItem = $('<div>')
        .addClass('color')
        .css({background: color})
        .on('click', function(e) {
            var rgb = color;
            currTool.color = rgb;
        }).on('mousedown', function(e) {
            $('.currColor').removeClass('currColor');
            $(this).addClass('currColor');
            $(this).data("longClick", setTimeout(function(){
			    lClick = true;
		    },200));
        }).on('contextmenu', function(e) {
            $("<div>").on('click', function() {
                paletteItem.remove();
                $(this).remove();
            }).html("Delete")
            .addClass('context-item').css({
                left: e.pageX,
                top: e.pageY
            }).appendTo('body');

            return false;
        });

        paletteItem.appendTo('#color-palette');
        $(document).on('mouseup', function() {
		    clearTimeout(paletteItem.data("longClick"));
		    lClick = false;
	    });
}

$(document).on('mousedown', function(e) {
    if(!(e.target.className == "context-item"))
        $('.context-item').remove();
});

//TODO: write common function for this type of thing
$('#color-settings').on('mousemove', function(e) {
    if(lClick) {
        var r = $('.currColor');

        e.preventDefault();
		document.getSelection().removeAllRanges();
		var x = e.pageX - $('#color-palette').offset().left;
		if(!(r.index() == 0)) {
			var prev = r.prev();
            if(r.position().top == prev.position().top) {
                if(x < (prev.position().left - (prev.width()))) {
                    r.insertBefore(prev);
                }
            }
		}

		if(!(r.index() == $('.color').length - 1)) {
			var next = r.next();
            if(r.position().top == next.position().top) {
                if(x > (next.position().left - (next.width()))) {
                    r.insertAfter(next);
                }
            }
		}

        var y = e.pageY;
        if(!(r.index == ($('.color').length - 1))) {
            if(y > r.position().top + (r.height()) * 1.5) {
                var next = r.next();
                while(next.position().left != r.position().left ) {
                    if(next.index() == ($('.color').length - 1)) {
                        r.insertAfter(next);
                        return;
                    }
                    next = next.next();
                }
                r.insertAfter(next);
            }
        }

        if(!(r.index == 0)) {
            if(y < r.position().top - (r.height())) {
                var prev = r.prev();
                while(prev.position().left != r.position().left ) {
                    if(prev.index() == 0) {
                        r.insertBefore(prev);
                        return;
                    }
                    prev = prev.prev();
                }
                r.insertBefore(prev);
            }
        }
    }
});

$('#addToPalette').on('click', function(e) {
    addPaletteItem(currTool.color);
});

$('#colorwheel-toggle').on('click', function() {
    $('#wheel').toggle();
});

$('#hsv-toggle').on('click', function() {
    $('#hsv-settings').toggle();
});

$('#gradient-toggle').on('click', function() {

});

$('#palette-toggle').on('click', function() {
    $('#color-settings').toggle();
});

var hue = new SliderVar('hue');
var hue = new SliderVar('saturation');
var hue = new SliderVar('value');