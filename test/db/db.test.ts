import { describe, test } from 'bun:test';
import { Column, DataSource, Entity, PrimaryColumn } from 'typeorm';

@Entity("test")
export class Test {
    @PrimaryColumn()
    id: string;

    @Column({
        type: 'varchar',
        nullable: false
    })
    name: string | number;

    @Column({
        type: 'timestamp',
        nullable: true
    })
    ts: Date;
}

function getDS(): DataSource {
    let ds: DataSource = new DataSource({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: "kodo",
        password: "abc!@#123",
        database: "kodo_test",
        synchronize: false,
        logging: true,
        entities: [Test],
        subscribers: [],
    });
    return ds;
}

// describe("DB", async function () {
//     test("1", async () => {
        
//         let ds = getDS();
//         await ds.initialize();

//         let repo = ds.getRepository(Test);
//         let t = new Test();
//         t.id = "1";
//         t.name = "Shadow";
//         t.ts = new Date();

//         await repo.insert(t);
//     });
// });