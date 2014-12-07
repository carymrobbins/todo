package utils

import org.joda.time.{DateTimeZone, DateTime}

object DateTimeUtil {
  def utcNow() = DateTime.now(DateTimeZone.UTC)
}
