$(document).ready(function() {
    var $todos = $("#todos");
    $.get("/todos", function(todos) {
        $.each(todos, function(_, todo) {
            $todos.append($("<li></li>").append(makeUpdateForm(todo)));
        });
    });
});

var makeUpdateForm = function(todo) {
    var completed = todo.completedOn !== undefined && todo.completedOn !== null;
    var $text, $completed;
    return $("<form></form>")
        .append($('<input type="hidden" name="id"/>').val(todo.id))
        .append($text = $('<input type="text" name="text"/>').val(todo.text))
        .append($completed = $('<input type="checkbox" name="completed"/>').prop('checked', completed))
        .append($('<button>Update</button>'))
        .on('submit', function(e) {
            e.preventDefault();
            updateTodo(todo.id, $text.val(), $completed.prop('checked'));
        });
};

var updateTodo = function(id, text, completed) {
    var r = jsRoutes.controllers.Application.updateTodo(id);
    $.ajax({
        url: r.url,
        type: r.type,
        data: {text: text, completed: completed}
    });
};
