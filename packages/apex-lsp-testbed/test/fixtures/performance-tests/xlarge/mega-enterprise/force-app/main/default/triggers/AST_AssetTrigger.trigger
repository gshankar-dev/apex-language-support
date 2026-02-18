trigger AST_AssetTrigger on Asset (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    AST_BaseService_121.ServiceConfig config =
        new AST_BaseService_121.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            AST_Domain_128 domain =
                new AST_Domain_128();
            AST_Domain_128.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (AST_Domain_128.ValidationError err : validation.errors) {
                    if (err.severity == AST_Domain_128.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        AST_RecordService_123 service =
            new AST_RecordService_123();
        AST_BaseService_121.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'AST trigger error: ' + error);
            }
        }
    }
}
