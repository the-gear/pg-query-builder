import SelectBuilder from '../src/pg-query-builder';
import './serializer';

/**
 * SelectBuilder
 */
describe('SelectBuilder', () => {
  it('is instantiable', () => {
    expect(new SelectBuilder()).toBeInstanceOf(SelectBuilder);
  });

  it('should create minimal query', () => {
    const query = new SelectBuilder().select('1 + 1 as result');
    expect(query).toMatchSnapshot();
  });

  it('should create simple query', () => {
    const query = new SelectBuilder('"testTable"')
      .select('a, b')
      .select('"c"')
      .select('1 + 1 as calculated');
    expect(query).toMatchSnapshot();
  });

  it('should throw if argument length mismatch', () => {
    expect(() => {
      new SelectBuilder('"testTable"').where('a = $$', 1, 2);
    }).toThrow();
  });

  it('can change command', () => {
    const query = new SelectBuilder();
    query
      .setCommand('SELECT DISTINCT')
      .select('a')
      .select('b')
      .from('TEST');
    expect(query).toMatchSnapshot();
  });

  it('should create complex query', () => {
    expect(createComplexQuery({})).toMatchSnapshot();

    expect(
      createComplexQuery({
        userId: '123',
        fromDate: new Date(1542673386000),
        endDate: null,
        kinds: ['IN', 'OUT'],
        peer: 'the-peer',
        limit: 20,
      }),
    ).toMatchSnapshot();
  });
});

function createComplexQuery({
  userId,
  limit,
  fromDate,
  endDate,
  kinds,
  peer,
}: any) {
  const query = new SelectBuilder('"Table"');

  query
    .select(
      `CONCAT('Expr:', "tableId") as "id"`,
      '"fromPerson"."personPublicId" as "from"',
      '"toPerson"."personPublicId" as "to",*',
    )
    .join(
      'JOIN "Person" "fromPerson" on "Table"."fromPersonId" = "fromPerson"."personId"',
    )
    .join(
      'JOIN "Person" "toPerson" on "Table"."toPersonId" = "toPerson"."personId"',
    )
    .setLimit(limit);

  if (userId) {
    query.where(
      '"fromPerson"."userId" = $$ OR "toPerson"."userId" = $$',
      userId,
      userId,
    );
  } else {
    query.where('FALSE');
  }

  if (fromDate) {
    query.where('"createdAt" >= $$', fromDate);
  }

  if (endDate) {
    query.where('"createdAt" <= $$', endDate);
  }

  if (kinds) {
    query.where('"kinds" IN ($$)', kinds);
  }

  if (peer) {
    query.where(
      '"fromPerson"."personPublicId" = $$ OR "toPerson"."personPublicId" = $$',
      peer,
      peer,
    );
  }

  query.orderBy('"createdAt" DESC');

  return query;
}
