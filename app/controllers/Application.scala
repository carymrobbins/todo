package controllers

import models.Todo
import play.api.Routes
import play.api.data.Form
import play.api.data.Forms._
import play.api.libs.json.Json
import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

  case class NewTodoData(text: String)

  val newTodoForm: Form[NewTodoData] = Form {
    mapping(
      "text" -> nonEmptyText
    )(NewTodoData.apply)(NewTodoData.unapply)
  }

  def addTodo() = Action { implicit request =>
    newTodoForm.bindFromRequest.value match {
      case None => BadRequest("The text field is required!")
      case Some(data) => Todo.add(data.text); Ok
    }
  }

  def getTodos = Action {
    Ok(Json.toJson(Todo.list))
  }

  case class UpdateTodoData(text: String, completed: Boolean)

  val updateTodoForm = Form {
    mapping(
      "text" -> nonEmptyText,
      "completed" -> boolean
    )(UpdateTodoData.apply)(UpdateTodoData.unapply)
  }

  def updateTodo(id: Long) = Action { implicit request =>
    updateTodoForm.bindFromRequest.value match {
      case None => BadRequest("The text field is required!")
      case Some(data) => Todo.update(id, data.text, data.completed) match {
        case None => NotFound
        case Some(_) => Ok
      }
    }
  }

  def jsRoutes = Action { implicit request =>
    Ok(
      Routes.javascriptRouter("jsRoutes")(
        controllers.routes.javascript.Application.addTodo,
        controllers.routes.javascript.Application.updateTodo
      )
    ).as("text/javascript")
  }
}
