package models

import models.database.Todos
import org.joda.time.{DateTimeZone, DateTime}
import play.api.Play.current
import play.api.db.slick.Config.driver.simple._
import play.api.db.slick.DB
import play.api.libs.json.Json

import scala.slick.lifted.TableQuery


case class Todo(id: Option[Long], text: String, createdOn: DateTime, completedOn: Option[DateTime]) {
  def insert: Todo = DB.withSession { implicit session =>
    (Todo.todos returning Todo.todos.map(_.id)
      into ((todo, id) => todo.copy(id = Some(id)))) += this
  }
}

object Todo {
  private val todos: TableQuery[Todos] = TableQuery[Todos]
  val tupled = (Todo.apply _).tupled
  implicit val asJson = Json.format[Todo]
  def create(text: String) = Todo(None, text, DateTime.now(DateTimeZone.UTC), None)
  def unapplyText(todo: Todo) = Some(todo.text)
  def list = DB.withSession { implicit session => todos.list }
}
