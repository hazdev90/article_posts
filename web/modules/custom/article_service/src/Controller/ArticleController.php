<?php

namespace Drupal\article_service\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Database;

class ArticleController extends ControllerBase
{

    public function createArticle(Request $request)
    {
        $data = json_decode($request->getContent(), TRUE);

        // Validasi
        $errors = [];
        if (empty($data['title']) || strlen($data['title']) < 20) {
            $errors[] = 'Title must be at least 20 characters.';
        }
        if (empty($data['content']) || strlen($data['content']) < 200) {
            $errors[] = 'Content must be at least 200 characters.';
        }
        if (empty($data['category']) || strlen($data['category']) < 3) {
            $errors[] = 'Category must be at least 3 characters.';
        }
        if (empty($data['status']) || !in_array($data['status'], ['publish', 'draft', 'trash'])) {
            $errors[] = 'Status must be one of: publish, draft, trash.';
        }

        if (!empty($errors)) {
            return new JsonResponse(['errors' => $errors], 400);
        }

        // Simpan ke database
        $connection = Database::getConnection();
        $connection->insert('posts')
            ->fields([
                'title' => $data['title'],
                'content' => $data['content'],
                'category' => $data['category'],
                'status' => $data['status'],
                'created_date' => date('Y-m-d H:i:s'),
                'updated_date' => date('Y-m-d H:i:s'),
            ])
            ->execute();

        return new JsonResponse(['message' => 'Article created successfully']);
    }

    public function getAllArticles()
    {
        $connection = \Drupal::database();
        $query = $connection->select('posts', 'p')
            ->fields('p', ['id', 'title', 'content', 'category', 'status'])
            ->orderBy('created_date', 'DESC');

        $results = $query->execute()->fetchAll();

        $articles = [];
        foreach ($results as $row) {
            $articles[] = [
                'id' => $row->id,
                'title' => $row->title,
                'content' => $row->content,
                'category' => $row->category,
                'status' => $row->status,
            ];
        }

        return new JsonResponse($articles);
    }

    public function getArticles($limit, $offset)
    {
        $connection = \Drupal::database();
        $query = $connection->select('posts', 'p')
            ->fields('p', ['id', 'title', 'content', 'category', 'status'])
            ->range($offset, $limit)
            ->orderBy('created_date', 'DESC');

        $results = $query->execute()->fetchAll();

        $articles = [];
        foreach ($results as $row) {
            $articles[] = [
                'id' => $row->id,
                'title' => $row->title,
                'content' => $row->content,
                'category' => $row->category,
                'status' => $row->status,
            ];
        }

        return new JsonResponse($articles);
    }

    public function getArticleById($id)
    {
        $connection = \Drupal::database();
        $query = $connection->select('posts', 'p')
            ->fields('p', ['id', 'title', 'content', 'category', 'status'])
            ->condition('id', $id)
            ->execute()
            ->fetchObject();

        if ($query) {
            $article = [
                'id' => $query->id,
                'title' => $query->title,
                'content' => $query->content,
                'category' => $query->category,
                'status' => $query->status,
            ];
            return new JsonResponse($article);
        } else {
            return new JsonResponse(['error' => 'Article not found.'], 404);
        }
    }

    public function updateArticle($id, Request $request)
    {
        $data = json_decode($request->getContent(), TRUE);

        $connection = \Drupal::database();
        $record_exists = $connection->select('posts', 'p')
            ->fields('p', ['id'])
            ->condition('id', $id)
            ->execute()
            ->fetchField();

        if (!$record_exists) {
            return new JsonResponse(['error' => 'Article not found.'], 404);
        }

        if($data['status'] == 'trash'){
            $connection->update('posts')
                ->fields([
                    'status' => $data['status'],
                    'updated_date' => date('Y-m-d H:i:s'),
                ])
                ->condition('id', $id)
                ->execute();
        }else{
            // Validasi
            $errors = [];
            if (empty($data['title']) || strlen($data['title']) < 20) {
                $errors[] = 'Title must be at least 20 characters.';
            }
            if (empty($data['content']) || strlen($data['content']) < 200) {
                $errors[] = 'Content must be at least 200 characters.';
            }
            if (empty($data['category']) || strlen($data['category']) < 3) {
                $errors[] = 'Category must be at least 3 characters.';
            }
            if (empty($data['status']) || !in_array($data['status'], ['publish', 'draft', 'trash'])) {
                $errors[] = 'Status must be one of: publish, draft, trash.';
            }

            if (!empty($errors)) {
                return new JsonResponse(['errors' => $errors], 400);
            }

            $connection->update('posts')
                ->fields([
                    'title' => $data['title'],
                    'content' => $data['content'],
                    'category' => $data['category'],
                    'status' => $data['status'],
                    'updated_date' => date('Y-m-d H:i:s'),
                ])
                ->condition('id', $id)
                ->execute();
        }

        return new JsonResponse(['message' => 'Article updated successfully']);
    }

    public function deleteArticle($id)
    {
        $connection = \Drupal::database();

        // Cek apakah artikel ada
        $exists = $connection->select('posts', 'p')
            ->fields('p', ['id'])
            ->condition('id', $id)
            ->execute()
            ->fetchField();

        if (!$exists) {
            return new JsonResponse(['error' => 'Article not found.'], 404);
        }

        // Hapus artikel
        $connection->delete('posts')
            ->condition('id', $id)
            ->execute();

        return new JsonResponse(['message' => 'Article deleted successfully']);
    }
}
