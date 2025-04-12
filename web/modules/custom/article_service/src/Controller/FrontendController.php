<?php

namespace Drupal\article_service\Controller;

use Drupal\Core\Controller\ControllerBase;

class FrontendController extends ControllerBase
{

    public function allPosts()
    {
        return [
            '#theme' => 'article_all',
            '#empty' => $this->t('No leads found.'),
            '#attached' => [
                'library' => [
                    'article_service/article_frontend',
                ]
            ],
        ];
    }

    public function addPost()
    {
        return [
            '#theme' => 'article_add',
            '#attached' => [
                'library' => ['article_service/article_frontend'],
            ],
        ];
    }

    public function editPost($id)
    {
        return [
            '#theme' => 'article_edit',
            '#article_id' => $id,
            '#attached' => [
                'library' => ['article_service/article_frontend'],
            ],
        ];
    }

    public function preview()
    {
        return [
            '#theme' => 'article_preview',
            '#attached' => [
                'library' => ['article_service/article_frontend'],
            ],
        ];
    }
}
