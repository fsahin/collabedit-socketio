(function() {

    var socket = io.connect('/collabedit');

    $("#formLogin").bind('submit', function() {
        socket.emit('login', $('#input-name').val());
        return false;
    });

    $('#doc').keyup(function(){
        socket.emit('edit', $(this).val());
        return false;
    });

    var users = []; //Users that are currently logged in


    //Socket.io event handlers

    socket.on('users', function(msg) {
        users = msg;
        render_names();
    });

    socket.on('exit', function(msg) {
        users = $.grep(users, function(value, index) {
            return value != msg });
        render_names();
    });

    socket.on('edit', function(msg) {
        var cursorPos = $("#doc").getCursorPosition();  //Get current position
        $('#doc').val(msg);
        $("#doc").setCursorPosition(cursorPos);
    });


    //Helper functions
    function render_names() {
        var result = $.map(users, function(value, index) {
            return '<li>' + value + '</li>';
        });
        $("#names").html(result.join('\n'));
    }

    //Get cursor position
    new function($) {
        $.fn.getCursorPosition = function() {
            var el = $(this).get(0);
            var pos = 0;
            if('selectionStart' in el) {
                pos = el.selectionStart;
            } else if('selection' in document) {
                el.focus();
                var Sel = document.selection.createRange();
                var SelLength = document.selection.createRange().text.length;
                Sel.moveStart('character', -el.value.length);
                pos = Sel.text.length - SelLength;
            }
            return pos;
        }
    }(jQuery);

    //Set cursor position
    new function($) {
        $.fn.setCursorPosition = function(pos) {
            if ($(this).get(0).setSelectionRange) {
                $(this).get(0).setSelectionRange(pos, pos);
            } else if ($(this).get(0).createTextRange) {
                var range = $(this).get(0).createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos);
                range.moveStart('character', pos);
                range.select();
            }
        }
    }(jQuery);
})();
