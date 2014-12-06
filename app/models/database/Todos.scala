package models.database

import PortableJodaSupport._
import models.Todo
import org.joda.time.DateTime
import play.api.db.slick.Config.driver.simple._

class Todos(tag: Tag) extends Table[Todo](tag, "todo") {
  def id: Column[Long] = column[Long]("id", O.PrimaryKey, O.AutoInc)
  def text: Column[String] = column[String]("text")
  def createdOn: Column[DateTime] = column[DateTime]("created_on")
  def completedOn: Column[Option[DateTime]] = column[Option[DateTime]]("completed_on")

  override def * = (id.?, text, createdOn, completedOn) <> (Todo.tupled, Todo.unapply)
}
