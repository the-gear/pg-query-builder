import SelectBuilder from '../src/pg-query-builder';

expect.addSnapshotSerializer({
  test(value) {
    return value && value instanceof SelectBuilder;
  },
  print(value, serialize, indent) {
    const { query, params } = value.createQuery();

    return ['SQL {\n', indent(query), '\n} Arguments ', serialize(params)].join(
      '',
    );
  },
});
