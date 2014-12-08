$(document).ready(function() {
    var $todos = $("#todos");
    writeTodosList($todos);
    configureAddTodoForm($todos);
});

var displayError = function(e, defaultError) {
    var error = (e && e.responseText) || defaultError || "Oops, an error occurred.",
        $modal = $('#errorModal');
    $modal.find('.error-message').text(error);
    $modal.find('.ok-button').on('click', function() { $modal.modal('hide'); });
    $modal.modal('show');
};

var configureAddTodoForm = function($todos) {
    var $addTodoForm = $("#addTodoForm"),
        $addTodoText = $addTodoForm.find("input[name=text]");
    $addTodoForm.on('submit', function(e) {
        e.preventDefault();
        var text = $addTodoText.val();
        var success = function (todo) { appendTodo($todos, todo); $addTodoText.val(""); };
        addTodo(text, success, displayError);
    });
};

var writeTodosList = function($todos) {
    var success = function(todos) {
        $.each(todos, function(_, todo) { appendTodo($todos, todo); });
    };
    getTodos(success, displayError);
};

var appendTodo = function($todos, todo) {
    $todos.append($('<div class="row"></div>').append(makeUpdateForm(todo)));
};

var makeUpdateForm = function(todo) {
    var completed = todo.completedOn !== undefined && todo.completedOn !== null;
    var $form, $text, $completed, $completedOn, $update, $delete;
    $form = $('<form role="form"></form>')
        .append($('<input type="hidden" name="id"/>').val(todo.id))
        .append($text = $('<input type="text" name="text" class="form-control" autocomplete="off"/>').val(todo.text))
        .append($completed = $('<input type="checkbox" name="completed"/>').prop('checked', completed))
        .append($update = $('<button class="btn btn-success"><i class="glyphicon glyphicon-ok"></i></button>'))
        .append($delete = $('<button class="btn btn-danger"><i class="glyphicon glyphicon-remove"></i></button>'))
        .append($completedOn = updateCompletedOnField($('<span></span>'), todo.completedOn))
        .on('submit', function(e) { e.preventDefault(); });
    $update.on('click', function () {
        var success = function (updatedTodo) {
            updateCompletedOnField($completedOn, updatedTodo.completedOn);
        };
        updateTodo(todo.id, $text.val(), $completed.prop('checked'), success, displayError);
    });
    $delete.on('click', function () {
        var success = function () { $form.parent().remove(); };
        deleteTodo(todo.id, success, displayError);
    });
    return $form;
};

var updateCompletedOnField = function($completedOn, newCompletedOn) {
    return newCompletedOn === undefined
        ? $completedOn.text("")
        : $completedOn.text('Completed ' + moment(newCompletedOn).fromNow());
};

var getTodos = function(success, error) {
    var r = jsRoutes.controllers.Application.getTodos();
    $.ajax({
        url: r.url,
        type: r.type,
        success: success,
        error: error
    });
};

var addTodo = function(text, success, error) {
    var r = jsRoutes.controllers.Application.addTodo();
    $.ajax({
        url: r.url,
        type: r.type,
        data: {text: text},
        success: success,
        error: error
    });
};

var updateTodo = function(id, text, completed, success, error) {
    var r = jsRoutes.controllers.Application.updateTodo(id);
    $.ajax({
        url: r.url,
        type: r.type,
        data: {text: text, completed: completed},
        success: success,
        error: error
    });
};

var deleteTodo = function(id, success, error) {
    var r = jsRoutes.controllers.Application.deleteTodo(id);
    $.ajax({
        url: r.url,
        type: r.type,
        success: success,
        error: error
    });
};
