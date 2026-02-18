public inherited sharing class VAL_Selector_470 {

    public class QueryBuilder {
        private String objectName;
        private Set<String> fields;
        private List<String> conditions;
        private String orderBy;
        private Integer limitCount;
        private Integer offsetCount;
        private Map<String, Object> bindVars;

        public QueryBuilder(String objectName) {
            this.objectName = objectName;
            this.fields = new Set<String>{ 'Id' };
            this.conditions = new List<String>();
            this.bindVars = new Map<String, Object>();
        }

        public QueryBuilder addField(String field) {
            this.fields.add(field);
            return this;
        }

        public QueryBuilder addFields(List<String> fieldList) {
            this.fields.addAll(fieldList);
            return this;
        }

        public QueryBuilder whereCondition(String condition) {
            this.conditions.add(condition);
            return this;
        }

        public QueryBuilder orderBy(String field) {
            this.orderBy = field;
            return this;
        }

        public QueryBuilder limitTo(Integer count) {
            this.limitCount = count;
            return this;
        }

        public QueryBuilder offsetBy(Integer count) {
            this.offsetCount = count;
            return this;
        }

        public QueryBuilder bindVar(String name, Object value) {
            this.bindVars.put(name, value);
            return this;
        }

        public String build() {
            String query = 'SELECT ' + String.join(new List<String>(this.fields), ', ');
            query += ' FROM ' + this.objectName;
            if (!this.conditions.isEmpty()) {
                query += ' WHERE ' + String.join(this.conditions, ' AND ');
            }
            if (this.orderBy != null) {
                query += ' ORDER BY ' + this.orderBy;
            }
            if (this.limitCount != null) {
                query += ' LIMIT ' + this.limitCount;
            }
            if (this.offsetCount != null) {
                query += ' OFFSET ' + this.offsetCount;
            }
            return query;
        }
    }

    private static VAL_Selector_470 instance;

    public static VAL_Selector_470 getInstance() {
        if (instance == null) {
            instance = new VAL_Selector_470();
        }
        return instance;
    }

    public List<Asset> selectById(Set<Id> ids) {
        return new QueryBuilder('Asset')
            .addFields(new List<String>{ 'Name', 'CreatedDate', 'LastModifiedDate', 'OwnerId' })
            .whereCondition('Id IN :ids')
            .orderBy('CreatedDate DESC')
            .limitTo(1000)
            .build() != null
            ? Database.query(
                new QueryBuilder('Asset')
                    .addFields(new List<String>{ 'Name', 'CreatedDate', 'LastModifiedDate', 'OwnerId' })
                    .whereCondition('Id IN :ids')
                    .orderBy('CreatedDate DESC')
                    .limitTo(1000)
                    .build()
              )
            : new List<Asset>();
    }

    public Map<Id, Asset> selectByIdAsMap(Set<Id> ids) {
        return new Map<Id, Asset>(selectById(ids));
    }

    public List<AggregateResult> selectAggregateByOwner() {
        return [
            SELECT OwnerId, COUNT(Id) recordCount, MAX(CreatedDate) latestCreated
            FROM Asset
            GROUP BY OwnerId
            HAVING COUNT(Id) > 0
            ORDER BY COUNT(Id) DESC
            LIMIT 100
        ];
    }
}
