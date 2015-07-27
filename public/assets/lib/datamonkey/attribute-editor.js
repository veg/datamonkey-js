function datamonkey_cancel(self) {
    $(self).show().next().remove();
}

function datamonkey_change(elem, self) {
    $(self).text ($(elem).closest('form').find('input').val())
        .show()
        .next().remove();
}

function datamonkey_check_valid_value (value, value_list, previous) {
    if (value.length) {
        if (value == previous) {
            return true;
        }
        if (value_list) {
            return !(value in value_list);
        }
        return true;
    }
    return false;
}

function datamonkey_editable(self, value_list) {
    $(self).hide();

    var div            = d3.select ($(self).parent()[0]).append ("div").classed ("input-group", true);
        text_field     = div.append ("input").style ("margin-right","1em"),
        button_ok      = div.append ("button").classed ("btn btn-primary btn-xs", true),
        button_cancel  = div.append ("button").classed ("btn btn-primary btn-xs", true),
        current_value  = $(self).text();

    button_ok.append ("i").classed ("glyphicon glyphicon-ok", true);
    button_cancel.append ("i").classed ("glyphicon glyphicon-remove", true);

    console.log (value_list);


    $(text_field[0]).val(current_value).on ("input propertychange", function (event) {
        button_ok.property ("disabled", !datamonkey_check_valid_value ($(this).val(), value_list,current_value));
    });

    /*
    var form_element = $(self).parent().append(

    $(self).parent().append(
        $('<form />', {
            class: 'form-inline',
            role: 'form'
        }).append(
            $('<span>').attr ('class', 'editable-container editable-inline')
            .append(
                $('<div />', {
                    class: 'editableform-loading'
                }).append(
                    $('<form />', {
                        class: 'form-inline editableform'
                    }).append(
                        $('<div />', {
                            class: 'editable-input'
                        }).append(
                            $('<input />', {
                                class: 'form-control input-sm',
                                val: $(self).text()
                            }).
                            append(
                                $('<span />', {
                                    class: 'editable-clear-x'
                                })
                            )
                        ),
                        $('<div />', {
                            class: 'editable-buttons'
                        }).append(
                            $('<button />', {
                                class: 'btn btn-primary btn-sm editable-submit',
                            }).append(
                                $('<i />', {
                                    class: 'glyphicon glyphicon-ok'
                                })
                            ).click(function(e) {
                                datamonkey_change(this, self);
                            }),
                            $('<button />', {
                                class: 'btn btn-primary btn-sm editable-submit',
                            }).append(
                                $('<i />', {
                                    class: 'glyphicon glyphicon-remove'
                                })
                            ).click(function(e) {
                                datamonkey_cancel(self);
                            })
                        ),
                        $('<div />', {
                            class: 'editable-error-block help-block'
                        })
                    )
                )
            )
        )
    )*/
}

datamonkey.editable = datamonkey_editable;
