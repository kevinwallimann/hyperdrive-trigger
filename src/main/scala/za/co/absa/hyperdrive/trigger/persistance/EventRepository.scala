/*
 * Copyright 2018-2019 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package za.co.absa.hyperdrive.trigger.persistance

import slick.dbio.DBIO
import za.co.absa.hyperdrive.trigger.models.Event
import za.co.absa.hyperdrive.trigger.models.tables.JDBCProfile.profile._
import scala.concurrent.{ExecutionContext, Future}

trait EventRepository extends Repository {
  def getAllEvents()(implicit executionContext: ExecutionContext): Future[Seq[Event]]
  def insertEvents(events: Seq[Event])(implicit executionContext: ExecutionContext): DBIOAction[Unit, NoStream, Effect.Write]
  def getExistEvents(sensorEventIds: Seq[String])(implicit executionContext: ExecutionContext): Future[Seq[String]]
  def insertEvent(event: Event)(implicit executionContext: ExecutionContext): Future[Int]
}

class EventRepositoryImpl extends EventRepository {

  override def getAllEvents()(implicit ec: ExecutionContext): Future[Seq[Event]] = db.run(
    eventTable.result
  )

  override def insertEvents(events: Seq[Event])(implicit ec: ExecutionContext): DBIOAction[Unit, NoStream, Effect.Write] =
    DBIO.seq(eventTable ++= events)

  override def getExistEvents(sensorEventIds: Seq[String])(implicit ec: ExecutionContext): Future[Seq[String]] = db.run(
    eventTable.filter(e =>  e.sensorEventId.inSet(sensorEventIds)).map(_.sensorEventId).result
  )

  override def insertEvent(event: Event)(implicit executionContext: ExecutionContext): Future[Int] = db.run {
    eventTable += event
  }

}