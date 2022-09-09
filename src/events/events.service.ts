import { Repository } from 'typeorm';
import { Get, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
  ) {}

  getWarmupEvents() {
    return this.eventRepository.find();
  }

  /*
     Requirements:
    - maximum 2 sql queries
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    Hints:
    - open the `src/events/events.service` file
    - partial or not working answers also get graded so make sure you commit what you have
    Sample response on GET /events:
    ```json
    [
      {
        id: 1,
        name: 'Laravel convention 2021',
        createdAt: '2021-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 1,
            start: '2021-02-21 10:00:00',
            end: '2021-02-21 16:00:00',
            eventId: 1,
            name: 'Illuminate your knowledge of the laravel code base',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
      {
        id: 2,
        name: 'Laravel convention 2023',
        createdAt: '2023-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 2,
            start: '2023-10-21 10:00:00',
            end: '2023-10-21 18:00:00',
            eventId: 2,
            name: 'The new Eloquent - load more with less',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
          {
            id: 3,
            start: '2023-11-21 09:00:00',
            end: '2023-11-21 17:00:00',
            eventId: 2,
            name: 'AutoEx - handles exceptions 100% automatic',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
      {
        id: 3,
        name: 'React convention 2023',
        createdAt: '2023-04-25T09:32:27.000000Z',
        workshops: [
          {
            id: 4,
            start: '2023-08-21 10:00:00',
            end: '2023-08-21 18:00:00',
            eventId: 3,
            name: '#NoClass pure functional programming',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
          {
            id: 5,
            start: '2023-08-21 09:00:00',
            end: '2023-08-21 17:00:00',
            eventId: 3,
            name: 'Navigating the function jungle',
            createdAt: '2021-04-25T09:32:27.000000Z',
          },
        ],
      },
    ]
     */

  @Get('events')
  async getEventsWithWorkshops() {
    // Approch
    // Run group by in the workshop table and get the event ID
    // Get all the event IDs by ID where workshop is available.
    // const result = await this.eventRepository.query(
    //   'SELECT eventId , count(eventId) from workshop group by eventId having count(eventId) > 0',
    // );

    // return this.eventRepository.query(
    //   'SELECT * FROM workshop where id in (whatever we got from the result)',
    // );

    return this.eventRepository.query(
      `SELECT e.*, w.* FROM event e inner join workshop w  on e.id = w.eventId where e.id in (SELECT eventId from workshop group by eventId having count(eventId) > 0)`,
    );
  }

  /*
    Requirements:
    - only events that have not yet started should be included
    - the event starting time is determined by the first workshop of the event
    - the code should result in maximum 3 SQL queries, no matter the amount of events
    - all filtering of records should happen in the database
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    Hints:
    - open the `src/events/events.service.ts` file
    - partial or not working answers also get graded so make sure you commit what you have
    - join, whereIn, min, groupBy, havingRaw might be helpful
    - in the sample data set  the event with id 1 is already in the past and should therefore be excluded
    Sample response on GET /futureevents:
    ```json
    [
        {
            "id": 2,
            "name": "Laravel convention 2023",
            "createdAt": "2023-04-20T07:01:14.000000Z",
            "workshops": [
                {
                    "id": 2,
                    "start": "2023-10-21 10:00:00",
                    "end": "2023-10-21 18:00:00",
                    "eventId": 2,
                    "name": "The new Eloquent - load more with less",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                },
                {
                    "id": 3,
                    "start": "2023-11-21 09:00:00",
                    "end": "2023-11-21 17:00:00",
                    "eventId": 2,
                    "name": "AutoEx - handles exceptions 100% automatic",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                }
            ]
        },
        {
            "id": 3,
            "name": "React convention 2023",
            "createdAt": "2023-04-20T07:01:14.000000Z",
            "workshops": [
                {
                    "id": 4,
                    "start": "2023-08-21 10:00:00",
                    "end": "2023-08-21 18:00:00",
                    "eventId": 3,
                    "name": "#NoClass pure functional programming",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                },
                {
                    "id": 5,
                    "start": "2023-08-21 09:00:00",
                    "end": "2023-08-21 17:00:00",
                    "eventId": 3,
                    "name": "Navigating the function jungle",
                    "createdAt": "2021-04-20T07:01:14.000000Z",
                }
            ]
        }
    ]
    ```
     */

  @Get('futureevents')
  async getFutureEventWithWorkshops() {
    // Get the first workshop of the event

    // Not sure why the relationship is not added in the entity
    // @OneToMany() - in event
    // @ManyToOne() - in workshop

    // What is first workshop of the event is not clear
    //
    /**
     First query workshop table  
     - Group by - eventId and get min of startDate and having filter greater than today 
     - This will give the response of all the eventIds 
     - Get those eventIds and get all the event and workshop using inner join and filter By ID 

     This whole process can be achieved by either using a temp table or using a subquery. 
     
     SELECT eventId FROM workshop group by eventId having min(start) >  '2022-09-09' 
     
     SELECT e.*, w.* 
     FROM event e inner join workshop w on w.eventId = e.Id
     WHERE e.Id In ( SELECT eventId FROM workshop group by eventId having min(start) >  '2022-09-09'  )
     */

    //
    return this.eventRepository.createQueryBuilder();
  }
}
