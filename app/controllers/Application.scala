package controllers

import models.Todo
import play.api.Routes
import play.api.data.Form
import play.api.data.Forms.{text => _, _}
import play.api.libs.json.Json
import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index())
  }

  val newTodoForm: Form[Todo] = Form {
    mapping(
      "text" -> nonEmptyText
    )(Todo.create)(Todo.unapplyText)
  }

  def addTodo() = Action { implicit request =>
    newTodoForm.bindFromRequest.get.insert
    Redirect(routes.Application.index())
  }

  def getTodos = Action {
    Ok(Json.toJson(Todo.list))
  }

  val updateTodoForm = Form {
    tuple(
      "text" -> nonEmptyText,
      "completed" -> boolean
    )
  }

  def updateTodo(id: Long) = Action { implicit request =>
    updateTodoForm.bindFromRequest.value match {
      case None => BadRequest
      case Some((text, completed)) => Todo.update(id, text, completed) match {
        case None => NotFound
        case Some(_) => Ok
      }
    }
  }

  def jsRoutes = Action { implicit request =>
    Ok(
      Routes.javascriptRouter("jsRoutes")(
        controllers.routes.javascript.Application.updateTodo
      )
    ).as("text/javascript")
  }
}
